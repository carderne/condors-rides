import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

async function insertRides() {
  // Try to find the test user first
  const existingUser = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, "test_user_id"));

  // Only insert if the user doesn't exist
  if (existingUser.length === 0) {
    await db.insert(schema.user).values({
      id: "test_user_id",
      name: "test_user",
      email: "test_user_email",
      emailVerified: false,
    });
  }

  // Clear existing rides for this user
  await db.delete(schema.ride).where(eq(schema.ride.userId, "test_user_id"));

  // Insert new rides
  await db.insert(schema.ride).values([
    {
      userId: "test_user_id",
      slug: "2025-04-01",
      name: "Morning Ride",
      date: new Date("2025-04-01"),
      time: "09:00:00",
      speed: "28",
      route: "https://www.strava.com/routes/3339543184132710790",
    },
    {
      userId: "test_user_id",
      slug: "2025-04-03",
      name: "Golden Gate Loop",
      date: new Date("2025-04-03"),
      time: "16:30:00",
      speed: "26",
      route: "https://www.strava.com/routes/3339543184132710790",
    },
    {
      userId: "test_user_id",
      slug: "2025-04-05",
      name: "Mountain Climb",
      date: new Date("2025-04-05"),
      time: "07:15:00",
      speed: "22",
      route: "https://www.strava.com/routes/3339543184132710790",
    },
    {
      userId: "test_user_id",
      slug: "2025-04-10",
      name: "Sunset Cruise",
      date: new Date("2025-04-10"),
      time: "18:45:00",
      speed: "25",
      route: "https://www.strava.com/routes/3339543184132710790",
    },
    {
      userId: "test_user_id",
      slug: "2025-04-12",
      name: "Recovery Ride",
      date: new Date("2025-04-12"),
      time: "10:30:00",
      speed: "20",
      route: "https://www.strava.com/routes/3339543184132710790",
    },
  ]);

  console.log("Rides inserted successfully!");
  process.exit(0);
}

insertRides();
