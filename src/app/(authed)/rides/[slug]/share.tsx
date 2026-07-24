"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleClick = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older / restricted webviews
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(el);
    }
    setCopied(true);
  };

  return (
    <div className={className}>
      <div className="relative">
        <Button onClick={handleClick} variant="ghost" aria-label="Copy link">
          <Share2Icon /> Share
        </Button>
        {copied && (
          <div className="absolute top-full right-0 mt-1 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
            <CheckIcon className="size-3" /> URL copied
          </div>
        )}
      </div>
    </div>
  );
}
