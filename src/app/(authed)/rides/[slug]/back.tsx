"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant="ghost" className={className}>
      <ArrowLeftIcon /> Back
    </Button>
  );
}
