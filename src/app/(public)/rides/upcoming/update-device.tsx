"use client";

import { updateDeviceDetailsAction } from "@/components/pwa/actions";
import { getDeviceId } from "@/hooks/client-id";
import { getDeviceType } from "@/hooks/device-type";
import { useEffect } from "react";

export function UpdateDeviceDetails() {
  // TODO delete this component
  useEffect(() => {
    const fn = async () => {
      const deviceType = getDeviceType();
      const deviceId = getDeviceId();
      await updateDeviceDetailsAction(deviceType, deviceId);
    };
    fn();
  }, []);
  return null;
}
