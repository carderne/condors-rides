import { db, schema } from "@/db";

const USERS = [
  {
    id: "1",
    name: "Ridey McRideface",
    email: "email1",
    emailVerified: false,
  },
  {
    id: "2",
    name: "Bobby",
    email: "email2",
    emailVerified: false,
  },
  {
    id: "3",
    name: "Tadej Pogacar",
    email: "email3",
    emailVerified: false,
  },
  {
    id: "4",
    name: "Jacinda",
    email: "email4",
    emailVerified: false,
  },
];

async function insertRides() {
  await db.insert(schema.user).values(USERS);

  await db.insert(schema.ride).values([
    // Old rides
    {
      userId: "1",
      slug: "2025-03-04-woodstock",
      name: "Woodstock ride",
      surface: "road",
      date: new Date("2025-03-04"),
      time: "18:00:00",
      speed: "22",
      distance: 40,
      elevation: 450,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      cafeStop: "Blakes at Clanfield",
      notes: "Route is a bit lumpy to start",
      startPoint: "Oxford",
    },
    {
      userId: "1",
      slug: "2025-03-06-slow-ride",
      name: "Slow ride",
      surface: "road",
      date: new Date("2025-03-06"),
      time: "16:30:00",
      speed: "20",
      distance: 40,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      cafeStop: "Blakes at Clanfield",
      startPoint: "Oxford",
    },
    {
      userId: "2",
      slug: "2025-03-08-cotswolds-tour",
      name: "Cotswolds tour",
      surface: "road",
      date: new Date("2025-03-08"),
      time: "09:00:00",
      speed: "26",
      distance: 40,
      elevation: 1000,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      cafeStop: "Blakes at Clanfield",
      notes: "Route is a bit lumpy to start",
      startPoint: "Oxford",
    },
    // Current rides
    {
      userId: "2",
      slug: "2025-04-08-elsfield",
      name: "Elsfield loop",
      surface: "road",
      date: new Date("2025-04-08"),
      time: "18:00:00",
      speed: "28",
      distance: 40,
      elevation: 110,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      notes: "Route is a bit lumpy to start",
      startPoint: "Oxford",
    },
    {
      userId: "1",
      slug: "2025-04-08-slow-ride",
      name: "Slow ride",
      surface: "road",
      date: new Date("2025-04-08"),
      time: "17:30:00",
      speed: "20",
      distance: 40,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      cafeStop: "Blakes at Clanfield",
      startPoint: "Oxford",
    },
    {
      userId: "1",
      slug: "2025-04-10-brilly",
      name: "Brilly",
      surface: "road",
      date: new Date("2025-04-10"),
      time: "18:15:00",
      speed: "26",
      distance: 40,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      notes: "Route is a bit lumpy to start",
      startPoint: "Oxford",
    },
    {
      userId: "2",
      slug: "2025-04-12-chilterns",
      name: "Chilterns 100",
      surface: "road",
      date: new Date("2025-04-12"),
      time: "09:00:00",
      speed: "28",
      distance: 40,
      elevation: 400,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      cafeStop: "Blakes at Clanfield",
      startPoint: "Oxford",
    },
    {
      id: "9",
      userId: "1",
      slug: "2025-04-12-screamer",
      name: "Screamer",
      surface: "road",
      date: new Date("2025-04-12"),
      time: "08:30:00",
      speed: "40",
      distance: 40,
      elevation: 900,
      routeUrl: "https://www.strava.com/routes/3339543184132710790",
      maxGroupSize: 8,
      notes: "Route is a bit lumpy to start",
      startPoint: "Oxford",
    },
  ]);

  await db.insert(schema.rideMember).values([
    { rideId: "9", userId: "2" },
    { rideId: "9", userId: "3" },
    { rideId: "9", userId: "4" },
  ]);

  console.log("Rides inserted successfully!");
  process.exit(0);
}

insertRides();
