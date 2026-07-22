import { getRidePreview, type RidePreview } from "@/dal/ridePreview";
import { getConfig } from "@/lib/config";
import { surfaceStyle } from "@/lib/surface";
import { format } from "date-fns";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const { baseUrl } = getConfig();

function buildDescription(ride: RidePreview): string {
  const parts: string[] = [];
  parts.push(format(ride.date, "EEE d MMM") + " at " + ride.time.slice(0, 5));
  parts.push(surfaceStyle(ride.surface).label);
  if (ride.distance !== null) parts.push(`${ride.distance} km`);
  if (ride.elevation !== null) parts.push(`${ride.elevation} m climbing`);
  if (ride.speed) parts.push(`${ride.speed} kph`);
  return parts.join(" · ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ride = await getRidePreview(slug);
  if (!ride) {
    return { title: "Ride not found · Condors Rides" };
  }

  const title = `${ride.name} · Condors Rides`;
  const description = buildDescription(ride);
  const url = `${baseUrl}/rides/${slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Condors Rides",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RidePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ride = await getRidePreview(slug);
  if (!ride) {
    notFound();
  }

  // Only social crawlers are routed here (via middleware); render a minimal
  // body with a link through to the real ride page for any human who lands here.
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{ride.name}</h1>
      <p>{buildDescription(ride)}</p>
      <Link href={`/rides/${slug}`}>View this ride on Condors Rides</Link>
    </main>
  );
}
