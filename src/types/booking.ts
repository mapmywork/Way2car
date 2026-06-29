// ─── Booking Types ────────────────────────────────────────────────

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Booking {
  id: string;
  confirmationCode: string;
  userId: string;
  vehicleId: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: Date;
  dropoffDate: Date;
  totalPrice: number; // stored in paise
  taxAmount: number; // stored in paise
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  vehicleId: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  pickupDate: string; // ISO 8601 date string
  dropoffDate: string; // ISO 8601 date string
}

export interface BookingWithDetails extends Booking {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    type: string;
    images: string[];
    pricePerDay: number;
  };
  pickupLocation: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  dropoffLocation: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  payment: {
    id: string;
    amount: number;
    status: string;
    razorpayPaymentId: string | null;
  } | null;
}
