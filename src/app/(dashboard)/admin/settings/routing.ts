// Define the locales clearly
export const locales = ['en', 'am'] as const;
export const defaultLocale = 'en' as const;

export const routing = {
  locales,
  defaultLocale
};

// Instead of special helpers, we export the core logic
export type Locale = (typeof locales)[number];