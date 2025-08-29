"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RidesTabSwitcher() {
  const pathname = usePathname();
  return (
    <div className="mx-auto -mt-4 flex w-full gap-2 rounded-b-xl border-x-2 border-b-2 border-pink-200 bg-white p-1.5 shadow-lg md:w-fit">
      <Link
        href="/rides/old"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("old")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Old
      </Link>
      <Link
        href="/rides/upcoming"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("upcoming")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Upcoming
      </Link>
      <Link
        href="/rides/future"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("future")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Future
      </Link>
      <Link
        href="/rides/joined"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("joined")
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Joined
      </Link>
    </div>
  );
}
