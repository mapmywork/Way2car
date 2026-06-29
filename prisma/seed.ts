import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

// ─── Seed Script — Way2Car ───────────────────────────────────────
// Seeds the database with:
// - 3 Locations
// - 12 Vehicles (4 per location)
// - 60 days of availability per vehicle
// - 3 Users (1 admin + 2 customers)

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cannot seed in production environment!");
  }

  console.log("🌱 Seeding Way2Car database...\n");

  // ── Clean existing data ──────────────────────────────────────
  await prisma.availability.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ Cleared existing data");

  // ── Seed Users ───────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@way2car.com",
      phone: "+919876543210",
      passwordHash,
      role: "ADMIN",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+919876543211",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+919876543212",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  console.log(`✓ Created ${3} users (1 admin + 2 customers)`);

  // ── Seed Locations ───────────────────────────────────────────
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: "Way2Car Mumbai Central",
        address: "123, Marine Drive, Churchgate",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400020",
        latitude: 18.9387,
        longitude: 72.8353,
        hours: ["Mon-Fri: 8:00 AM - 9:00 PM", "Sat-Sun: 9:00 AM - 6:00 PM"],
        phone: "+912212345678",
        email: "mumbai@way2car.com",
      },
    }),
    prisma.location.create({
      data: {
        name: "Way2Car Delhi Airport",
        address: "Terminal 3, IGI Airport, Aerocity",
        city: "New Delhi",
        state: "Delhi",
        zip: "110037",
        latitude: 28.5562,
        longitude: 77.1,
        hours: ["Mon-Sun: 6:00 AM - 11:00 PM"],
        phone: "+911123456789",
        email: "delhi@way2car.com",
      },
    }),
    prisma.location.create({
      data: {
        name: "Way2Car Bangalore Koramangala",
        address: "45, 80 Feet Road, Koramangala 4th Block",
        city: "Bangalore",
        state: "Karnataka",
        zip: "560034",
        latitude: 12.9352,
        longitude: 77.6245,
        hours: ["Mon-Fri: 8:00 AM - 8:00 PM", "Sat: 9:00 AM - 5:00 PM", "Sun: Closed"],
        phone: "+918012345678",
        email: "bangalore@way2car.com",
      },
    }),
  ]);

  console.log(`✓ Created ${locations.length} locations`);

  // ── Seed Vehicles ────────────────────────────────────────────
  const vehicleData = [
    // ── Mumbai ──
    {
      make: "Maruti Suzuki",
      model: "Swift",
      year: 2024,
      type: "HATCHBACK" as const,
      transmission: "MANUAL",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 150000, // ₹1,500
      images: ["/images/vehicles/swift-1.jpg", "/images/vehicles/swift-2.jpg"],
      description:
        "The Maruti Suzuki Swift is a stylish and fuel-efficient hatchback, perfect for city commutes and short trips. Features a peppy 1.2L engine with excellent mileage.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: false,
        sunroof: false,
        cruiseControl: false,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[0].id,
    },
    {
      make: "Hyundai",
      model: "Creta",
      year: 2024,
      type: "SUV" as const,
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seats: 5,
      doors: 4,
      pricePerDay: 300000, // ₹3,000
      images: ["/images/vehicles/creta-1.jpg", "/images/vehicles/creta-2.jpg"],
      description:
        "The Hyundai Creta is a premium compact SUV with a commanding road presence. Packed with features including a panoramic sunroof, ventilated seats, and Bose sound system.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[0].id,
    },
    {
      make: "Mercedes-Benz",
      model: "E-Class",
      year: 2023,
      type: "LUXURY" as const,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 800000, // ₹8,000
      images: ["/images/vehicles/eclass-1.jpg", "/images/vehicles/eclass-2.jpg"],
      description:
        "The Mercedes-Benz E-Class defines luxury motoring. With its refined interior, powerful engine, and cutting-edge technology, it's the ultimate executive sedan.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[0].id,
    },
    {
      make: "Honda",
      model: "City",
      year: 2024,
      type: "SEDAN" as const,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 220000, // ₹2,200
      images: ["/images/vehicles/city-1.jpg", "/images/vehicles/city-2.jpg"],
      description:
        "The Honda City is a refined and elegant sedan offering a perfect balance of comfort, performance, and fuel efficiency. Ideal for both city drives and highway cruising.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[0].id,
    },
    // ── Delhi ──
    {
      make: "Toyota",
      model: "Fortuner",
      year: 2024,
      type: "SUV" as const,
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seats: 7,
      doors: 4,
      pricePerDay: 500000, // ₹5,000
      images: ["/images/vehicles/fortuner-1.jpg", "/images/vehicles/fortuner-2.jpg"],
      description:
        "The Toyota Fortuner is a powerful and rugged SUV built for adventure. With its robust 2.8L diesel engine, 4WD capability, and spacious 7-seat cabin, it conquers any terrain.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: false,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[1].id,
    },
    {
      make: "Maruti Suzuki",
      model: "Dzire",
      year: 2024,
      type: "SEDAN" as const,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 170000, // ₹1,700
      images: ["/images/vehicles/dzire-1.jpg", "/images/vehicles/dzire-2.jpg"],
      description:
        "The Maruti Suzuki Dzire is a compact sedan that combines elegance with practicality. Its refined 1.2L engine delivers excellent mileage, making it perfect for daily commutes.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: false,
        sunroof: false,
        cruiseControl: false,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[1].id,
    },
    {
      make: "BMW",
      model: "5 Series",
      year: 2023,
      type: "LUXURY" as const,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 900000, // ₹9,000
      images: ["/images/vehicles/bmw5-1.jpg", "/images/vehicles/bmw5-2.jpg"],
      description:
        "The BMW 5 Series is the quintessential luxury sports sedan. With its twin-turbo engine, adaptive suspension, and premium interior, every drive is an exhilarating experience.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[1].id,
    },
    {
      make: "Kia",
      model: "Carnival",
      year: 2024,
      type: "VAN" as const,
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seats: 9,
      doors: 4,
      pricePerDay: 450000, // ₹4,500
      images: ["/images/vehicles/carnival-1.jpg", "/images/vehicles/carnival-2.jpg"],
      description:
        "The Kia Carnival is a premium MPV offering unmatched space and comfort for large groups. With VIP lounge seats, dual sunroofs, and a powerful diesel engine, it redefines family travel.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[1].id,
    },
    // ── Bangalore ──
    {
      make: "Tata",
      model: "Nexon EV",
      year: 2024,
      type: "SUV" as const,
      transmission: "AUTOMATIC",
      fuelType: "ELECTRIC",
      seats: 5,
      doors: 4,
      pricePerDay: 250000, // ₹2,500
      images: ["/images/vehicles/nexonev-1.jpg", "/images/vehicles/nexonev-2.jpg"],
      description:
        "The Tata Nexon EV is India's best-selling electric SUV. With a 312 km range, zippy acceleration, and zero emissions, it's the smart choice for eco-conscious drivers.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[2].id,
    },
    {
      make: "Volkswagen",
      model: "Virtus",
      year: 2024,
      type: "SEDAN" as const,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 230000, // ₹2,300
      images: ["/images/vehicles/virtus-1.jpg", "/images/vehicles/virtus-2.jpg"],
      description:
        "The Volkswagen Virtus is a premium midsize sedan with German engineering. Its 1.5L TSI turbo engine delivers thrilling performance, paired with a refined and spacious cabin.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: true,
        sunroof: true,
        cruiseControl: true,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[2].id,
    },
    {
      make: "Mahindra",
      model: "Thar",
      year: 2024,
      type: "CONVERTIBLE" as const,
      transmission: "MANUAL",
      fuelType: "DIESEL",
      seats: 4,
      doors: 2,
      pricePerDay: 350000, // ₹3,500
      images: ["/images/vehicles/thar-1.jpg", "/images/vehicles/thar-2.jpg"],
      description:
        "The Mahindra Thar is the iconic Indian off-roader. With its convertible top, 4x4 drivetrain, and rugged build, it's made for weekend adventures and open-air driving.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: false,
        sunroof: false,
        cruiseControl: false,
        backupCamera: true,
        keylessEntry: false,
      },
      locationId: locations[2].id,
    },
    {
      make: "Hyundai",
      model: "i20",
      year: 2024,
      type: "HATCHBACK" as const,
      transmission: "MANUAL",
      fuelType: "PETROL",
      seats: 5,
      doors: 4,
      pricePerDay: 140000, // ₹1,400
      images: ["/images/vehicles/i20-1.jpg", "/images/vehicles/i20-2.jpg"],
      description:
        "The Hyundai i20 is a premium hatchback with sporty looks and a feature-rich cabin. Its 1.2L engine offers peppy performance and excellent fuel economy.",
      features: {
        airConditioning: true,
        bluetooth: true,
        usbCharging: true,
        gps: false,
        sunroof: true,
        cruiseControl: false,
        backupCamera: true,
        keylessEntry: true,
      },
      locationId: locations[2].id,
    },
  ];

  const vehicles = await Promise.all(
    vehicleData.map((v) => prisma.vehicle.create({ data: v }))
  );

  console.log(`✓ Created ${vehicles.length} vehicles`);

  // ── Seed Availability (next 60 days) ─────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const availabilityRecords = [];

  for (const vehicle of vehicles) {
    for (let d = 0; d < 60; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() + d);

      availabilityRecords.push({
        vehicleId: vehicle.id,
        date,
        isAvailable: true,
      });
    }
  }

  await prisma.availability.createMany({ data: availabilityRecords });

  console.log(
    `✓ Created ${availabilityRecords.length} availability records (${vehicles.length} vehicles × 60 days)`
  );

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n🎉 Seed complete!\n");
  console.log("  Admin login:    admin@way2car.com / Password123");
  console.log("  Customer login: rahul@example.com / Password123");
  console.log("  Customer login: priya@example.com / Password123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
