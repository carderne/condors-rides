"use client";

import { H1 } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  console.log("PPP", pathname);
  return (
    <div className="my-4 flex flex-col items-center justify-between">
      <div className="flex w-full justify-between">
        <Link href="/rides">
          <div className="flex flex-col gap-0">
            <H1>Condors Rides</H1>
            <div className="text-xs">(Unofficial!)</div>
          </div>
        </Link>
        <div className="flex items-center">
          <Link
            href="/sign-out"
            className="text-primary flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-pink-100"
          >
            Sign out
          </Link>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex gap-2">
          <Link
            className={cn(
              "text-primary flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-pink-100",
              pathname === "/rides" ? "bg-pink-200" : "",
            )}
            href="/"
          >
            Upcoming
          </Link>
          <Link
            className={cn(
              "text-primary flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-pink-100",
              pathname === "/old" ? "bg-pink-200" : "",
            )}
            href="/old"
          >
            Old
          </Link>
        </div>
        <Link
          href="/manage/new"
          className="bg-primary hover:bg-primary-hover flex items-center gap-2 rounded-md px-4 py-2 text-white transition-colors"
        >
          <PlusCircleIcon className="size-4" />
          <span>New ride</span>
        </Link>
      </div>
    </div>
  );
}
