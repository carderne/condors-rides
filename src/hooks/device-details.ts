import type { DeviceType } from "@/db/schema";

const DEVICE_ID_KEY = "condors-device-id";

export function getDeviceDetails(): { deviceType: DeviceType; deviceId: string } {
  const deviceId = getDeviceId();
  const deviceType = getDeviceType();
  return { deviceType, deviceId };
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function getDeviceType(): DeviceType {
  if (typeof navigator === "undefined") {
    return "other"; // SSR-safe
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appPlatformValue = (window as any).__appPlatform;

  if (appPlatformValue === "android-app") {
    return appPlatformValue;
  }

  if (appPlatformValue === "ios-app") {
    return appPlatformValue;
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
