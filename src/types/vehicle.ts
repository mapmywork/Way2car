// ─── Vehicle Types ────────────────────────────────────────────────

export enum VehicleType {
  SEDAN = "SEDAN",
  SUV = "SUV",
  HATCHBACK = "HATCHBACK",
  LUXURY = "LUXURY",
  CONVERTIBLE = "CONVERTIBLE",
  VAN = "VAN",
}

export interface VehicleFeatures {
  airConditioning: boolean;
  gps: boolean;
  bluetooth: boolean;
  usbCharging: boolean;
  sunroof: boolean;
  cruiseControl: boolean;
  backupCamera: boolean;
  keylessEntry: boolean;
  [key: string]: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  transmission: "AUTOMATIC" | "MANUAL";
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  seats: number;
  doors: number;
  pricePerDay: number; // stored in paise (e.g., 150000 = ₹1,500.00)
  images: string[];
  description: string;
  features: VehicleFeatures;
  locationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleSearchParams {
  location?: string;
  pickupDate?: string;
  dropoffDate?: string;
  type?: VehicleType;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: "AUTOMATIC" | "MANUAL";
  fuelType?: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  sort?: "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export interface VehicleWithLocation extends Vehicle {
  location: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}
