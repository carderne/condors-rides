"use client";

import { useRouter } from "next/navigation";
import PullToRefresh from "pulltorefreshjs";
import { useEffect } from "react";

function isApp(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platform = (window as any).__appPlatform;
  return platform === "ios-app" || platform === "android-app";
}

export function UsePullToRefresh() {
  const router = useRouter();

  useEffect(() => {
    if (!isApp()) return;

    // Pull-to-refresh
    PullToRefresh.init({
      mainElement: "body",
      onRefresh() {
        router.refresh();
      },
    });

    // Swipe left to go back
    const SWIPE_THRESHOLD = 80;
    const EDGE_ZONE = 40;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      if (touch.clientX <= EDGE_ZONE) {
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;

      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);

      // Must swipe right (from left edge), far enough, and mostly horizontal
      if (dx >= SWIPE_THRESHOLD && dy < dx) {
        router.back();
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      PullToRefresh.destroyAll();
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);

  return null;
}
