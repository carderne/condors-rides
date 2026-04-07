"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof document !== "undefined" && document.referrer.includes("/rides/")) {
      router.back();
    } else {
      router.push("/rides/upcoming");
    }
  };

  return (
    <Button onClick={handleClick} variant="ghost" className={className}>
      <ArrowLeftIcon /> Back
    </Button>
  );
}
