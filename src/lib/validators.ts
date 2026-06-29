import { z } from "zod";

// ─── Zod Validators — Way2Car ────────────────────────────────────
// Centralized validation schemas for all API inputs.

// ─── Shared Primitives ───────────────────────────────────────────

const uuid = z.string().uuid("Invalid ID format");

const isoDate = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date format. Use ISO 8601.");

const positiveInt = z.number().int().positive();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ─── Auth Validators ─────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .max(255)
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be under 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

// ─── Vehicle Validators ──────────────────────────────────────────

export const vehicleTypeEnum = z.enum([
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "LUXURY",
  "CONVERTIBLE",
  "VAN",
]);

export const vehicleSearchSchema = z
  .object({
    location: z.string().optional(),
    pickupDate: isoDate.optional(),
    dropoffDate: isoDate.optional(),
    type: vehicleTypeEnum.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    seats: z.coerce.number().int().min(1).optional(),
    transmission: z.enum(["AUTOMATIC", "MANUAL"]).optional(),
    fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]).optional(),
    sort: z
      .enum(["price_asc", "price_desc", "newest", "rating"])
      .default("newest"),
  })
  .merge(paginationSchema)
  .refine(
    (data) => {
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    { message: "minPrice must be less than or equal to maxPrice" }
  );

export const createVehicleSchema = z.object({
  make: z.string().min(1).max(50).trim(),
  model: z.string().min(1).max(50).trim(),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  type: vehicleTypeEnum,
  transmission: z.enum(["AUTOMATIC", "MANUAL"]),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]),
  seats: z.number().int().min(2).max(15),
  doors: z.number().int().min(2).max(6),
  pricePerDay: positiveInt, // in paise
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  description: z.string().min(10).max(2000).trim(),
  features: z.record(z.string(), z.boolean()),
  locationId: uuid,
});

export const updateVehicleSchema = createVehicleSchema.partial();

// ─── Booking Validators ─────────────────────────────────────────

export const createBookingSchema = z
  .object({
    vehicleId: uuid,
    pickupLocationId: uuid,
    dropoffLocationId: uuid,
    pickupDate: isoDate,
    dropoffDate: isoDate,
  })
  .refine(
    (data) => new Date(data.pickupDate) > new Date(),
    { message: "Pickup date must be in the future", path: ["pickupDate"] }
  )
  .refine(
    (data) => new Date(data.dropoffDate) > new Date(data.pickupDate),
    { message: "Dropoff date must be after pickup date", path: ["dropoffDate"] }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

export const bookingFilterSchema = z
  .object({
    status: z
      .enum(["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"])
      .optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    vehicleId: uuid.optional(),
  })
  .merge(paginationSchema);

// ─── Payment Validators ─────────────────────────────────────────

export const createPaymentOrderSchema = z.object({
  bookingId: uuid,
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Payment ID is required"),
  razorpaySignature: z.string().min(1, "Signature is required"),
});

// ─── Availability Validators ────────────────────────────────────

export const availabilityCheckSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    { message: "End date must be after start date" }
  );

// ─── Type Exports ────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>;
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type AvailabilityCheckInput = z.infer<typeof availabilityCheckSchema>;
