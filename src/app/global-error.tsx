"use client";

import { H1 } from "@/components/ui/typography";
import Link from "next/link";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  const message = process.env.NODE_ENV === "production" ? "" : `message: ${error.message}`;
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <H1>Something went wrong</H1>
      <div>{message}</div>
      <div className="mt-4">Hit reload and you should be good</div>
      <p>
        <span>Or </span>
        <Link href="/" className="text-primary">
          return Home
        </Link>
      </p>
    </div>
  );
}
