"use client";

import type { DeviceType } from "@/db/schema";
import { useEffect, useState } from "react";

export function useDeviceType() {
  const [platform, setPlatform] = useState<DeviceType>("other");

  useEffect(() => {
    const data = getDeviceType();
    setPlatform(data);
  }, []);

  return platform;
}

export function getDeviceType(): DeviceType {
  if (typeof navigator === "undefined") {
    return "other"; // SSR-safe
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appPlatformValue = (window as any).__appPlatform;

  if (appPlatformValue === "android-app") {
    return "android-app";
  }

  if (appPlatformValue === "ios-app") {
    return "ios-app";
  }

  const ua = navigator.userAgent.toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isIOS = /ipad|iphone|ipod/.test(ua) && !(window as any).MSStream;

  if (isIOS) {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    return isStandalone ? "ios-pwa" : "ios";
  }

  if (/android/.test(ua)) return "android";

  if (/chrome/.test(ua) && !/edge|edg|opr|opera/.test(ua)) return "chrome";

  return "other";
}
