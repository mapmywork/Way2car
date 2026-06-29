import { db } from "@/lib/db";
import BookingTableClient from "@/components/admin/BookingTableClient";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      vehicle: { select: { id: true, make: true, model: true, year: true, type: true } },
      pickupLocation: { select: { name: true, city: true } },
      dropoffLocation: { select: { name: true, city: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <BookingTableClient bookings={bookings} />;
}
