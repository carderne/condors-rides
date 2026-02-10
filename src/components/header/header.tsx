"use client";

import CondorsLogo from "@/components/images/condors.png";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { User } from "@/db/zod";
import { checkIsAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { MenuIcon, PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function HeaderBar({ user }: { user: User | null }) {
  const isAdmin = user ? checkIsAdmin(user) : false;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const refresh = searchParams.get("refresh");

  useEffect(() => {
    if (refresh) {
      router.replace(pathname);
      router.refresh();
    }
  });

  const navItems = [
    { name: "Main site", href: "https://cowleyroadcondors.cc" },
    { name: "Rides", href: "/rides" },
    { name: "Map", href: "/map" },
    { name: "Settings", href: "/settings" },
    { name: "Stats", href: "/stats" },
    { name: "About", href: "/about" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return (
    <div className="w-full">
      {/* Mobile Menu Overlay */}
      {/* Header */}
      <header className="to-primary bg-gradient-to-t from-red-400 pt-8 text-white md:bg-gradient-to-r md:pt-0">
        {/* Desktop Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="">
                <Image src={CondorsLogo} alt="condors logo" height="20" priority={true} />
              </div>
            </Link>
            <nav className="hidden md:block">
              <ul className="flex gap-8">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "font-medium hover:underline",
                        pathname.startsWith(item.href) ? "font-extrabold underline" : "",
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/manage/new"
              className="text-primary flex items-center gap-2 rounded-md bg-white px-4 py-2 transition-colors hover:bg-white/90"
            >
              <PlusCircleIcon className="hidden size-4 md:block" />
              <span>New ride</span>
            </Link>
            <SignInOrOut user={user} />
            <MobileSheet navItems={navItems} user={user} />
          </div>
        </div>
      </header>
    </div>
  );
}

function MobileSheet({
  navItems,
  user,
}: {
  navItems: { name: string; href: string }[];
  user: User | null;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Menu"
          className="p-1 text-white hover:bg-white/20 hover:text-white md:hidden"
        >
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-gray-800 pt-40">
        <SheetHeader>
          <SheetTitle className="hidden">Navigation</SheetTitle>
          <SheetDescription className="hidden">No description</SheetDescription>
        </SheetHeader>
        <nav className="basis-1/2 px-8">
          <ul className="space-y-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block text-xl font-medium text-white hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <SignInOrOut user={user} className="block text-xl font-medium text-white" />
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function SignInOrOut({ user, className }: { user: User | null; className?: string }) {
  return (
    <Link
      href={user ? "/sign-out" : "/sign-in"}
      className={cn("hidden hover:underline md:block", className)}
    >
      {user ? "Sign out" : "Sign in"}
    </Link>
  );
}
