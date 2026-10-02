import type { Announcement, DayHours, DayKey, Promotion, Service } from '@/data/business';

/** The one document John edits from /admin. Missing keys fall back to defaults. */
export type StoreData = {
  services?: Service[];
  promotions?: Promotion[];
  announcement?: Announcement;
  hours?: Record<DayKey, DayHours>;
  hoursNote?: string;
  updatedAt?: string;
};

export type Driver = {
  name: 'vercel-blob' | 'local-disk';
  read(): Promise<StoreData | null>;
  write(data: StoreData): Promise<void>;
};

export const DATA_KEY = 'rj-site/data.json';
