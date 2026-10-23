export type ConsentChoice = "all" | "necessary" | "rejected" | null;

export interface CookiePreferences {
  status: ConsentChoice;
  timestamp: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface UserPersonalDataSummary {
  name?: string;
  phone?: string;
  address?: string;
  totalOrdersPlaced: number;
  cookieConsent: ConsentChoice;
  lastVisit: string;
}

export type LegalDocType = "privacy" | "terms";
