"use client";

import { H1 } from "@/components/ui/typography";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <div className="my-8 flex items-center justify-between">
      <H1>Condors Rides</H1>
      <div className="flex items-center gap-2">
        <Link
          className="text-primary flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          href="/"
        >
          Upcoming
        </Link>
        <Link
          className="text-primary flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          href="/old"
        >
          Old
        </Link>
        <Link
          href="/sign-out"
          className="text-primary flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
        >
          Sign out
        </Link>
        <Link
          href="/manage/new"
          className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>New ride</span>
        </Link>
      </div>
    </div>
  );
}
