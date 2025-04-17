"use client";

import CondorsLogo from "@/components/images/condors.png";
import { Button } from "@/components/ui/button";
import type { User } from "@/db/zod";
import { checkIsAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { MenuIcon, PlusCircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function HeaderBar({ user }: { user: User | null }) {
  const isAdmin = user ? checkIsAdmin(user) : false;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refresh = searchParams.get("refresh");

  useEffect(() => {
    if (refresh) {
      router.replace(pathname);
      router.refresh();
    }
  });

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { name: "Main site", href: "https://cowleyroadcondors.cc" },
    { name: "Rides", href: "/rides" },
    { name: "Archive", href: "/archive" },
    { name: "Routes", href: "/routes" },
  ];

  return (
    <div className="w-screen">
      {/* Mobile Menu Overlay */}
      <div className={cn("flex flex-col bg-gray-800", mobileMenuOpen ? "block" : "hidden")}>
        <div className="flex justify-end pt-4 pr-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMenu}
            aria-label="Close menu"
            className="p-1 text-white"
          >
            <XIcon size={28} />
          </Button>
        </div>
        <nav className="px-8 py-4">
          <ul className="space-y-6">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block text-xl font-medium text-white hover:underline"
                  onClick={toggleMenu}
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
      </div>
      {/* Header */}
      <header className="to-primary bg-gradient-to-r from-red-400 text-white">
        {/* Desktop Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <div className="mr-8">
              <Image src={CondorsLogo} alt="condors logo" height="20" />
            </div>
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
            {isAdmin && (
              <Link href="/admin" className="font-medium hover:underline">
                <span>Admin</span>
              </Link>
            )}
            <Link href="/settings" className="font-medium hover:underline">
              <span>Settings</span>
            </Link>
            <Link
              href="/manage/new"
              className="text-primary flex items-center gap-2 rounded-md bg-white px-4 py-2 transition-colors hover:bg-white/90"
            >
              <PlusCircleIcon className="size-4" />
              <span>New ride</span>
            </Link>
            <SignInOrOut user={user} />
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMenu}
              aria-label="Menu"
              className="p-1 text-white hover:bg-white/20 hover:text-white md:hidden"
            >
              <MenuIcon size={28} className="size-12" />
            </Button>
          </div>
        </div>
      </header>
    </div>
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
