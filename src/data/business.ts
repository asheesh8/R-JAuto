/**
 * R&J Auto Service: the single source of truth for every factual claim on the
 * site.
 *
 * 1. If a fact is not in this file (or in the admin store layered over it), it
 *    does not go on the website.
 * 2. Change it here and it changes everywhere. Never hard-code a phone number,
 *    hour or claim into a page.
 * 3. Anything marked TODO(rj) is unconfirmed or conflicting. Check with John
 *    before launch. Do not invent replacements.
 *
 * Sources (gathered 2026-10-01): the R&J Google Business listing (unclaimed,
 * 13 reviews), MapQuest and BBB listings, and a public Facebook post by Leo
 * DiSanto from August 15, 2020. See raw-assets/SOURCES.md.
 */

export const company = {
  name: 'R&J Auto Service',
  shortName: 'R&J',
  legalName: 'R & J Auto Service',
  shortDescription:
    'Independent auto repair shop on North Main Street in Barre, Vermont. Diagnostics, belts, cooling systems, brakes and same-day repairs from a mechanic Google reviewers call honest, fair and fast.',
  // Reviewers name him. TODO(rj): confirm John is the owner and get a last name.
  contact: 'John',
  url: 'https://www.rjautoservicevt.com', // TODO(rj): confirm domain
  phone: '(802) 479-9115',
  phoneRaw: '+18024799115',
  street: '460 N Main St',
  streetLong: '460 North Main Street',
  city: 'Barre',
  state: 'VT',
  stateLong: 'Vermont',
  zip: '05641',
  geo: { lat: 44.205067, lng: -72.5112774 },
  mapsUrl: 'https://maps.google.com/?cid=17927511610228824972',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=R+%26+J+Auto+Service+460+N+Main+St+Barre+VT+05641',
  mapsEmbed:
    'https://maps.google.com/maps?q=R%20%26%20J%20Auto%20Service%2C%20460%20N%20Main%20St%2C%20Barre%2C%20VT%2005641&t=&z=15&ie=UTF8&iwloc=&output=embed',
  timeZone: 'America/New_York',
};

export const cta = {
  call: `Call ${company.phone}`,
  callShort: 'Call the shop',
  directions: 'Get directions',
};

/** Google rating as shown on the listing on the scrape date. */
export const rating = {
  value: 4.9,
  count: 13,
  source: 'Google',
  asOf: '2026-10-01',
};

/* ------------------------------------------------------------------ */
/* Editable content. These are the defaults; the admin panel layers    */
/* saved changes over them at request time (src/lib/content.ts).       */
/* ------------------------------------------------------------------ */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type DayHours = { closed: boolean; open: string; close: string };

export const DAY_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};
export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * TODO(rj): hours conflict. Google shows the hours below; MapQuest says
 * Monday to Friday 9 to 6 and closed Saturday. Google is used because it is
 * the more recent listing and reviewers mention weekend help. Confirm with John
 * (he can fix them himself in /admin).
 */
export const DEFAULT_HOURS: Record<DayKey, DayHours> = {
  mon: { closed: false, open: '08:00', close: '19:00' },
  tue: { closed: false, open: '08:00', close: '19:00' },
  wed: { closed: false, open: '08:00', close: '19:00' },
  thu: { closed: false, open: '08:00', close: '19:00' },
  fri: { closed: false, open: '08:00', close: '19:00' },
  sat: { closed: false, open: '08:00', close: '17:00' },
  sun: { closed: true, open: '08:00', close: '17:00' },
};

/** Which 3D part sits on the service card. Files live in public/models/. */
export type PartKey =
  | 'pistons'
  | 'tensioner'
  | 'radiator'
  | 'brake'
  | 'oilfilter'
  | 'sparkplug'
  | 'coilover'
  | 'jack'
  | 'ratchet';

export const PART_LABELS: Record<PartKey, string> = {
  pistons: 'Pistons and crank',
  tensioner: 'Belt tensioner',
  radiator: 'Radiator',
  brake: 'Disc brake',
  oilfilter: 'Oil filter',
  sparkplug: 'Spark plug',
  coilover: 'Coilover shock',
  jack: 'Bottle jack',
  ratchet: 'Ratchet',
};

/**
 * available: shown and bookable.
 * seasonal:  shown; bookable only between seasonStart and seasonEnd (months,
 *            1 to 12, inclusive, wrapping past December). Outside the window
 *            the card says when it is back.
 * paused:    shown greyed out with the note, e.g. "Booked up until May".
 * hidden:    not shown at all.
 */
export type ServiceStatus = 'available' | 'seasonal' | 'paused' | 'hidden';

export type Service = {
  id: string;
  name: string;
  blurb: string;
  items: string[];
  part: PartKey;
  status: ServiceStatus;
  seasonStart: number;
  seasonEnd: number;
  note: string;
};

/**
 * TODO(rj): the service list is built from what reviewers say John fixed
 * (belt and tensioner, cooling flush, diagnosis, breakdowns) plus the core work
 * of any general repair shop. Walk it with John; he can hide anything he does
 * not do from /admin without a code change.
 */
export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'diagnostics',
    name: 'Diagnostics',
    blurb: 'Check engine lights, odd noises, no-starts. Find what is actually wrong before anything gets replaced.',
    items: ['Check engine light', 'No-start', 'Noises and leaks', 'Second opinions'],
    part: 'pistons',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'belts',
    name: 'Belts and tensioners',
    blurb: 'Serpentine and timing belts, tensioners and idler pulleys. The squeal you have been ignoring.',
    items: ['Serpentine belts', 'Tensioners', 'Idler pulleys', 'Timing belts'],
    part: 'tensioner',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'cooling',
    name: 'Cooling system',
    blurb: 'Overheating, coolant leaks and flushes. Radiators, hoses, thermostats and water pumps.',
    items: ['Coolant flush', 'Radiators', 'Hoses', 'Water pumps'],
    part: 'radiator',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'brakes',
    name: 'Brakes',
    blurb: 'Pads, rotors, calipers and lines. Salt eats brakes up here; we check the whole system.',
    items: ['Pads and rotors', 'Calipers', 'Brake lines', 'Fluid'],
    part: 'brake',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'oil',
    name: 'Oil and maintenance',
    blurb: 'Oil and filter changes, fluids and the scheduled stuff that keeps a car out of the tow line.',
    items: ['Oil and filter', 'Fluids', 'Filters', 'Inspections'],
    part: 'oilfilter',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'tuneup',
    name: 'Tune-ups and ignition',
    blurb: 'Spark plugs, coils and the misfire that shows up on the first cold morning.',
    items: ['Spark plugs', 'Ignition coils', 'Misfires', 'Rough idle'],
    part: 'sparkplug',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'suspension',
    name: 'Suspension and steering',
    blurb: 'Shocks, struts, ball joints and tie rods. Frost heaves are not kind.',
    items: ['Shocks and struts', 'Ball joints', 'Tie rods', 'Wheel bearings'],
    part: 'coilover',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
  {
    id: 'undercoating',
    name: 'Undercoating',
    blurb: 'Rubberized undercoating for the frame and wheel wells before the road salt goes down.',
    items: ['Frame', 'Wheel wells', 'Rocker panels'],
    part: 'jack',
    // The client asked for exactly this: no undercoating in winter.
    // TODO(rj): confirm the months with John.
    status: 'seasonal',
    seasonStart: 4,
    seasonEnd: 11,
    note: 'The coating needs a dry frame and warm air, so we stop when the salt trucks start.',
  },
  {
    id: 'repairs',
    name: 'Same-day repairs',
    blurb: 'Broke down on the way through Barre? Call first. If there is room in the bay and the part is in town, it can often be done the same day.',
    items: ['Breakdowns', 'Travelers', 'Weekend pinches', 'General repair'],
    part: 'ratchet',
    status: 'available',
    seasonStart: 1,
    seasonEnd: 12,
    note: '',
  },
];

export type Promotion = {
  id: string;
  active: boolean;
  title: string;
  detail: string;
  finePrint: string;
  badge: string;
  /** ISO dates (YYYY-MM-DD), inclusive. Empty means no limit. */
  starts: string;
  ends: string;
};

/**
 * One draft so the panel shows John what a promotion looks like. It is
 * inactive, so the public site shows nothing until he writes a real offer.
 */
export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'example-undercoat',
    active: false,
    title: 'Undercoat before the salt',
    detail: 'Book your undercoating in October and we will look over your brakes while it is on the lift.',
    finePrint: 'Example only. Edit or delete this in the admin panel.',
    badge: 'Fall',
    starts: '',
    ends: '',
  },
];

export type Announcement = { active: boolean; text: string; tone: 'info' | 'alert' };

export const DEFAULT_ANNOUNCEMENT: Announcement = {
  active: false,
  text: '',
  tone: 'info',
};

/* ------------------------------------------------------------------ */

export const faqs = [
  {
    q: 'Do I need an appointment?',
    a: 'Call first. If there is room in the bay you may get in the same day; reviewers mention exactly that. If not, John will tell you honestly when he can look at it.',
  },
  {
    q: 'My car broke down near Barre and I am not from here. Can you help?',
    a: 'That is a lot of our reviews. Have it towed to 460 North Main Street and call the shop so John knows it is coming.',
  },
  {
    q: 'Can you look at it on a Saturday?',
    a: 'Saturday hours are on this page. Reviewers say he has squeezed them in on weekends before, so call and ask.',
  },
  {
    q: 'Will I get a quote before you start?',
    a: 'Yes. You hear what is wrong, what is not, and what it costs before the work starts.',
  },
  {
    q: 'Do you do undercoating in the winter?',
    a: 'No. Undercoating needs a dry frame and warm air, so it is a spring to fall service. The services section shows whether it is open right now.',
  },
];

/**
 * CC-BY credits for the 3D parts, keyed by the file in public/models/. Only
 * parts that actually ship are listed in the footer (see src/data/models.json).
 */
export const modelCredits: { key: string; what: string; who: string; url: string; note?: string }[] = [
  { key: 'pistons', what: 'Engine', who: 'JuanG3D', url: 'https://sketchfab.com/3d-models/engine-36c1f32d649c46df9f2f8b4d34cf32c7' },
  // Placeholder brake until Joko_P's "Car Disc Brake" is downloaded; the
  // optimizer swaps it automatically once raw-assets/3d/rj_disc_brake.glb exists.
  { key: 'brake', what: '6-Lug Brake Rotor and Calipers', who: 'DRIVER-FIRE', url: 'https://sketchfab.com/3d-models/6-lug-brake-rotor-and-brembo-brake-calipers-ef37be6ddce44f49b6f616145c1e16af', note: 'modified: wordmark removed' },
  { key: 'coilover', what: 'Coilover Shock Absorber Damper', who: 'Robert Prispilović', url: 'https://sketchfab.com/3d-models/free-coilover-shock-absorber-damper-92e61757780840a683abdd38c4e8a700' },
  { key: 'sparkplug', what: 'Spark Plug', who: 'Vaughan.Staehr', url: 'https://sketchfab.com/3d-models/spark-plug-306c0031ba8445a79897fa060791758a' },
  { key: 'oilfilter', what: 'Oil Filter', who: 'VR DESIGNER', url: 'https://sketchfab.com/3d-models/oil-filter-f58436789f2c4ad4bff514223a220175' },
  { key: 'ratchet', what: 'Ratchet Wrench', who: 'anxietybot', url: 'https://sketchfab.com/3d-models/ratchet-wrench-free-3d-model-229bbddd09e6424a84e38c20fb195c3c' },
  { key: 'jack', what: 'Hydraulic Jack', who: 'Ben Milette', url: 'https://sketchfab.com/3d-models/hydraulic-jack-f5e69416bddc40fb8a152f05888bfe94' },
];
