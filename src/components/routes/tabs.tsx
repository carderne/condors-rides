"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function RoutesTabSwitcher() {
  const pathname = usePathname();
  return (
    <div className="mx-auto -mt-4 flex w-full gap-2 rounded-b-xl border-x-2 border-b-2 border-pink-200 bg-white p-1.5 shadow-lg md:w-fit">
      <Link
        href="/routes/all"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("all")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        All
      </Link>
      <Link
        href="/routes/promoted"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("promoted")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Promoted
      </Link>
      <Link
        href="/routes/liked"
        className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
          pathname.includes("liked")
            ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
            : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
        }`}
      >
        Liked
      </Link>
    </div>
  );
}
