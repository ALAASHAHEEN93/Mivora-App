export const CATEGORY_SLUGS = [
  "sports",
  "music",
  "dance",
  "arts",
  "stem",
  "theatre",
  "museum",
  "outdoors",
  "baby",
  "holidayCamp",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const ACCESSIBILITY_TAGS = ["wheelchair", "stroller", "sensoryFriendly", "signLanguage"] as const;
export type AccessibilityTag = (typeof ACCESSIBILITY_TAGS)[number];

/** Language codes for languages of instruction (ISO 639-1). */
export type LanguageCode = "de" | "en" | "ar" | "tr" | "uk" | "fr" | "es" | "it" | "pl";

export type Setting = "indoor" | "outdoor" | "both";

export type SourceType = "provider" | "admin" | "partner_feed" | "demo";

export interface Price {
  kind: "free" | "paid";
  /** Integer cents, EUR. Absent for free. */
  amountCents?: number;
  unit?: "perChild" | "perFamily" | "perSession";
}

export interface Session {
  id: string;
  startsAt: string; // ISO 8601 with offset
  endsAt: string;
  status: "scheduled" | "cancelled" | "full";
}

export interface LocalizedText {
  title: string;
  summary: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
  verified: boolean;
}

export interface Venue {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  district: string; // Stadtteil
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  slug: string;
  status: "published" | "draft" | "archived";
  categories: CategorySlug[];
  ageMin: number;
  ageMax: number;
  price: Price;
  languages: LanguageCode[];
  setting: Setting;
  accessibility: AccessibilityTag[];
  /** Whether accessibility info was checked by us or only stated by the provider. */
  accessibilitySource: "provider" | "verified";
  bookingMode: "external_link" | "inquiry";
  externalUrl?: string;
  cancellationPolicy: string;
  originalLocale: LanguageCode;
  /** Text by locale. Must contain originalLocale. */
  content: Partial<Record<LanguageCode, LocalizedText>>;
  provider: Provider;
  venue: Venue;
  sessions: Session[];
  source: { type: SourceType; reference: string };
  lastVerifiedAt: string;
  expiresAt: string;
  /** Hue used for the placeholder illustration until real photos exist. */
  accent: "coral" | "sunshine" | "teal" | "lavender";
}
