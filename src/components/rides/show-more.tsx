"use client";

import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

export function ShowMoreButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button className="w-fit" disabled={loading} onClick={() => setLoading(true)} asChild>
      <Link href="/rides/archive">
        {loading ? <Loader2Icon className="animate-spin" /> : "Show more"}
      </Link>
    </Button>
  );
}
