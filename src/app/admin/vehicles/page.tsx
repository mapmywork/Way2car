import { db } from "@/lib/db";
import VehicleTableClient from "@/components/admin/VehicleTableClient";

// Force dynamic rendering to always fetch latest DB records
export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const [vehicles, locations] = await Promise.all([
    db.vehicle.findMany({
      include: { location: true },
      orderBy: { createdAt: "desc" },
    }),
    db.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    })
  ]);

  return <VehicleTableClient vehicles={vehicles} locations={locations} />;
}
