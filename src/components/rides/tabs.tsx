"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RidesTabSwitcher() {
  const pathname = usePathname();
  return (
    <div className="flex justify-center">
      <div className="flex gap-2 overflow-hidden rounded-2xl border-2 border-pink-200 bg-white p-1.5 shadow-lg">
        <Link
          href="/rides/future"
          className={`rounded-xl px-6 py-3 font-medium transition-all ${
            pathname.includes("future")
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
              : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
          }`}
        >
          Future
        </Link>
        <Link
          href="/rides/upcoming"
          className={`rounded-xl px-6 py-3 font-medium transition-all ${
            pathname.includes("upcoming")
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
              : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
          }`}
        >
          Upcoming
        </Link>
        <Link
          href="/rides/old"
          className={`rounded-xl px-6 py-3 font-medium transition-all ${
            pathname.includes("old")
              ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
              : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
          }`}
        >
          Old
        </Link>
      </div>
    </div>
  );
}
