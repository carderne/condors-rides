"use client";

import CondorsLogo from "@/components/images/condors.png";
import type { User } from "@/db/zod";
import { cn } from "@/lib/utils";
import { MenuIcon, PlusCircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

export function CondorsHeader({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { name: "Main site", href: "https://cowleyroadcondors.cc" },
    { name: "Rides", href: "/rides" },
    { name: "Archive", href: "/old" },
    { name: "About", href: "/about" },
  ];

  return (
    <div className="w-full">
      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "flex flex-col bg-gray-800 transition-all",
          mobileMenuOpen ? "block" : "hidden",
        )}
      >
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
      <header className="bg-gradient-to-r from-red-400 to-pink-500 text-white">
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
