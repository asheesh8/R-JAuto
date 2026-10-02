import {
  company,
  DAY_ORDER,
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_HOURS,
  DEFAULT_PROMOTIONS,
  DEFAULT_SERVICES,
  PART_LABELS,
  type Announcement,
  type DayHours,
  type DayKey,
  type PartKey,
  type Promotion,
  type Service,
  type ServiceStatus,
} from '@/data/business';
import { readStore, type StoreData } from './store';

export type SiteContent = {
  services: Service[];
  promotions: Promotion[];
  announcement: Announcement;
  hours: Record<DayKey, DayHours>;
  hoursNote: string;
  updatedAt: string | null;
};

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ---------------------------------------------------------------- */
/* Validation. Everything from the admin passes through here before  */
/* it is stored, and again on read, so a bad document can never      */
/* break the public page.                                            */
/* ---------------------------------------------------------------- */

const STATUSES: ServiceStatus[] = ['available', 'seasonal', 'paused', 'hidden'];
const PARTS = Object.keys(PART_LABELS) as PartKey[];

const str = (v: unknown, max: number, fallback = '') =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : fallback;
const bool = (v: unknown, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const month = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : fallback;
};
const time = (v: unknown, fallback: string) => (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fallback);
const date = (v: unknown) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
const slug = (v: unknown, fallback: string) => {
  const s = str(v, 48).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return s || fallback;
};

export function cleanService(raw: unknown, i: number): Service | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const name = str(r.name, 60);
  if (!name) return null;
  const fallback = DEFAULT_SERVICES.find((s) => s.id === r.id);
  return {
    id: slug(r.id, `service-${i + 1}`),
    name,
    blurb: str(r.blurb, 220),
    items: Array.isArray(r.items) ? r.items.map((x) => str(x, 40)).filter(Boolean).slice(0, 6) : [],
    part: PARTS.includes(r.part as PartKey) ? (r.part as PartKey) : fallback?.part ?? 'ratchet',
    status: STATUSES.includes(r.status as ServiceStatus) ? (r.status as ServiceStatus) : 'available',
    seasonStart: month(r.seasonStart, 4),
    seasonEnd: month(r.seasonEnd, 11),
    note: str(r.note, 200),
  };
}

export function cleanPromotion(raw: unknown, i: number): Promotion | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const title = str(r.title, 80);
  if (!title) return null;
  return {
    id: slug(r.id, `promo-${i + 1}`),
    active: bool(r.active),
    title,
    detail: str(r.detail, 280),
    finePrint: str(r.finePrint, 200),
    badge: str(r.badge, 24),
    starts: date(r.starts),
    ends: date(r.ends),
  };
}

export function cleanHours(raw: unknown): Record<DayKey, DayHours> {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, Record<string, unknown> | undefined>;
  return Object.fromEntries(
    DAY_ORDER.map((d) => {
      const def = DEFAULT_HOURS[d];
      const v = r[d] ?? {};
      return [d, { closed: bool(v.closed, def.closed), open: time(v.open, def.open), close: time(v.close, def.close) }];
    }),
  ) as Record<DayKey, DayHours>;
}

export function cleanAnnouncement(raw: unknown): Announcement {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    active: bool(r.active),
    text: str(r.text, 160),
    tone: r.tone === 'alert' ? 'alert' : 'info',
  };
}

/** Validates a full document posted from the admin panel. */
export function cleanStore(raw: unknown): StoreData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: StoreData = {};
  if (Array.isArray(r.services)) {
    const seen = new Set<string>();
    out.services = r.services
      .slice(0, 24)
      .map(cleanService)
      .filter((s): s is Service => !!s && !seen.has(s.id) && !!seen.add(s.id));
  }
  if (Array.isArray(r.promotions)) {
    const seen = new Set<string>();
    out.promotions = r.promotions
      .slice(0, 12)
      .map(cleanPromotion)
      .filter((p): p is Promotion => !!p && !seen.has(p.id) && !!seen.add(p.id));
  }
  if (r.announcement) out.announcement = cleanAnnouncement(r.announcement);
  if (r.hours) out.hours = cleanHours(r.hours);
  if (typeof r.hoursNote === 'string') out.hoursNote = str(r.hoursNote, 160);
  return out;
}

/* ---------------------------------------------------------------- */

export async function getContent(): Promise<SiteContent> {
  const raw: StoreData = await readStore().catch(() => ({}));
  const saved = cleanStore(raw);
  return {
    services: saved.services ?? DEFAULT_SERVICES,
    promotions: saved.promotions ?? DEFAULT_PROMOTIONS,
    announcement: saved.announcement ?? DEFAULT_ANNOUNCEMENT,
    hours: saved.hours ?? DEFAULT_HOURS,
    hoursNote: saved.hoursNote ?? '',
    updatedAt: raw.updatedAt ?? null,
  };
}

/* ---------------------------------------------------------------- */
/* Derived state, always computed in the shop's time zone.            */
/* ---------------------------------------------------------------- */

export type ShopClock = { year: number; month: number; day: number; iso: string; dayKey: DayKey; minutes: number };

export function shopClock(now = new Date()): ShopClock {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: company.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const dayKey = String(parts.weekday).slice(0, 3).toLowerCase() as DayKey;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    iso: `${parts.year}-${parts.month}-${parts.day}`,
    dayKey,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function inSeason(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

export type ServiceView = Service & {
  bookable: boolean;
  /** Short state label for the card chip, e.g. "In season" or "Back in April". */
  stateLabel: string;
  stateTone: 'ok' | 'season' | 'off';
};

export function viewServices(services: Service[], clock = shopClock()): ServiceView[] {
  return services
    .filter((s) => s.status !== 'hidden')
    .map((s) => {
      if (s.status === 'paused') return { ...s, bookable: false, stateLabel: 'Not booking right now', stateTone: 'off' as const };
      if (s.status === 'seasonal') {
        const open = inSeason(clock.month, s.seasonStart, s.seasonEnd);
        return {
          ...s,
          bookable: open,
          stateLabel: open ? `In season until ${MONTHS[s.seasonEnd - 1]}` : `Back in ${MONTHS[s.seasonStart - 1]}`,
          stateTone: open ? ('season' as const) : ('off' as const),
        };
      }
      return { ...s, bookable: true, stateLabel: 'Available', stateTone: 'ok' as const };
    });
}

export function activePromotions(promotions: Promotion[], clock = shopClock()): Promotion[] {
  return promotions.filter((p) => p.active && (!p.starts || p.starts <= clock.iso) && (!p.ends || p.ends >= clock.iso));
}

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export function fmtTime(t: string): string {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3, 5);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return m === '00' ? `${h12} ${suffix}` : `${h12}:${m} ${suffix}`;
}

/** Groups consecutive days with identical hours: "Mon–Fri 8 AM–7 PM". */
export function hoursSummary(hours: Record<DayKey, DayHours>) {
  const short: Record<DayKey, string> = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
  const label = (h: DayHours) => (h.closed ? 'Closed' : `${fmtTime(h.open)} to ${fmtTime(h.close)}`);
  const rows: { days: string; time: string; closed: boolean }[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    let j = i;
    while (j + 1 < DAY_ORDER.length && label(hours[DAY_ORDER[j + 1]]) === label(hours[DAY_ORDER[i]])) j++;
    rows.push({
      days: i === j ? short[DAY_ORDER[i]] : `${short[DAY_ORDER[i]]} to ${short[DAY_ORDER[j]]}`,
      time: label(hours[DAY_ORDER[i]]),
      closed: hours[DAY_ORDER[i]].closed,
    });
    i = j + 1;
  }
  return rows;
}

export function openState(hours: Record<DayKey, DayHours>, clock = shopClock()) {
  const today = hours[clock.dayKey];
  const open = !today.closed && clock.minutes >= toMin(today.open) && clock.minutes < toMin(today.close);
  if (open) return { open: true, label: `Open until ${fmtTime(today.close)}` };
  // Find the next opening.
  const idx = DAY_ORDER.indexOf(clock.dayKey);
  for (let k = 0; k < 8; k++) {
    const d = DAY_ORDER[(idx + k) % 7];
    const h = hours[d];
    if (h.closed) continue;
    if (k === 0 && clock.minutes >= toMin(h.open)) continue;
    const when = k === 0 ? 'today' : k === 1 ? 'tomorrow' : d[0].toUpperCase() + d.slice(1, 3);
    return { open: false, label: `Closed now. Opens ${when} at ${fmtTime(h.open)}` };
  }
  return { open: false, label: 'Closed' };
}

/** schema.org openingHoursSpecification from the live hours. */
export function hoursSchema(hours: Record<DayKey, DayHours>) {
  const names: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  return DAY_ORDER.filter((d) => !hours[d].closed).map((d) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: names[d],
    opens: hours[d].open,
    closes: hours[d].close,
  }));
}
