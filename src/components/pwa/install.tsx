"use client";

import { useDeviceType } from "@/hooks/device-type";
import { ShareIcon, SquarePlusIcon } from "lucide-react";

function InstallInstructions() {
  return (
    <ol className="space-y-3 text-sm">
      <li className="flex items-start gap-3">
        <ShareIcon className="text-primary font-medium" />
        <span>Tap Share</span>
      </li>

      <li className="flex items-start gap-3">
        <SquarePlusIcon className="text-primary font-medium" />
        <span>Swipe up and tap Add to Home Screen</span>
      </li>
    </ol>
  );
}

export function InstallPwaCard() {
  const deviceType = useDeviceType();
  return deviceType === "ios" ? (
    <InstallInstructions />
  ) : deviceType === "ios-pwa" ? (
    "Already installed"
  ) : (
    "Only available on iOS right now"
  );
}
