"use client";

import { cn } from "@/lib/utils";
import { DownloadIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// In the iOS/Android webview wrapper, navigating to the GPX endpoint just
// renders the file as a page instead of downloading it. So we fetch the file
// ourselves and hand it to the native share sheet (Web Share API with files),
// which lets people open it directly in Wahoo/Garmin/etc. On platforms without
// file sharing we fall back to a real blob download.
export function GpxButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const filename = `${slugify(name)}.gpx`;

  const onClick = async () => {
    if (busy) return;

    // Android app: the Flutter webview has no DownloadListener, so blob
    // downloads and the Web Share API both fail. Its navigation delegate does
    // forward `intent://` URLs to an external app though, so we bounce the GPX
    // endpoint out to Chrome, which downloads it properly (we send it with a
    // Content-Disposition attachment) and offers "open with Wahoo/Garmin/etc".
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const platform = typeof window !== "undefined" ? (window as any).__appPlatform : undefined;
    if (platform === "android-app") {
      const { host } = window.location;
      window.location.href = `intent://${host}/rides/${slug}/gpx#Intent;scheme=https;end`;
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/rides/${slug}/gpx`);
      if (!res.ok) {
        throw new Error(`GPX request failed: ${res.status}`);
      }
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "application/gpx+xml" });

      // Prefer the native share sheet so people can "open in" a bike computer
      // app. canShare with files guards against platforms that can't.
      const canShareFile =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFile) {
        try {
          // Share ONLY the file: adding title/text makes iOS treat it as a
          // text share (messaging apps etc.) instead of matching apps that
          // register for .gpx files (Strava, Wahoo, Garmin, Organic Maps...).
          await navigator.share({ files: [file] });
          return;
        } catch (err) {
          // User cancelled the share sheet: do nothing.
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Otherwise fall through to a plain download.
        }
      }

      downloadBlob(blob, filename);
    } catch (err) {
      console.error("gpx download failed", err);
      toast.error("Couldn't download the GPX, try again.");
    } finally {
      setBusy(false);
    }
  };

  const canShare =
    typeof navigator !== "undefined" && typeof (navigator as Navigator).share === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn("cursor-pointer", className)}
    >
      GPX
      {canShare ? <Share2Icon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
    </button>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "route"
  );
}
