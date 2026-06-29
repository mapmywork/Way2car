// ─── Location Types ───────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  hours: string[]; // e.g., ["Mon-Fri: 8AM-8PM", "Sat-Sun: 9AM-6PM"]
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationSummary {
  id: string;
  name: string;
  city: string;
  state: string;
}
