"use client";

import { useRouter } from "next/navigation";
import PullToRefresh from "pulltorefreshjs";
import { useEffect } from "react";

export function UsePullToRefresh() {
  const router = useRouter();
  useEffect(() => {
    // @ts-expect-error standalone is iOS specific
    const isIOSPWA = window.navigator.standalone === true;
    if (isIOSPWA) {
      PullToRefresh.init({
        mainElement: "body",
        onRefresh() {
          router.refresh();
        },
      });
    }
  }, []);
  return null;
}
