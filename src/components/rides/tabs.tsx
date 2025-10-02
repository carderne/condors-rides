"use client";

import { capitalize } from "@/lib/fmt";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabVal = { path: string; color: "pink" | "green" };

export function TabSwitcher({ prefix, tabs }: { prefix: string; tabs: TabVal[] }) {
  return (
    <div className="mx-auto flex w-full gap-2 rounded-b-xl border-x-2 border-b-2 border-pink-200 bg-white p-1.5 text-sm shadow-lg md:w-fit">
      {tabs.map(({ path, color }) => (
        <Tab key={path} prefix={prefix} path={path} color={color} />
      ))}
    </div>
  );
}

function Tab({ prefix, path, color }: { prefix: string } & TabVal) {
  const pathname = usePathname();
  const activeColor =
    color === "pink"
      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md"
      : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md";

  return (
    <Link
      href={`/${prefix}/${path}`}
      className={`rounded-xl px-3 py-3 font-medium transition-all md:px-6 ${
        pathname.includes(path) ? activeColor : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
      }`}
    >
      {capitalize(path)}
    </Link>
  );
}
