"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { H3 } from "@/components/ui/typography";
import type { Sub } from "@/db/zod";
import { getDeviceId } from "@/hooks/client-id";
import { useDeviceType } from "@/hooks/device-type";
import { askPermission } from "@/lib/notifications";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getSubAction,
  persistAppTokenAction,
  setRideNewNotificationAction,
  setRideUpdateNotificationAction,
} from "./actions";

export const NOTIFICATION_DEVICES = ["android-app", "ios-app"];

export function PushNotificationManager() {
  const deviceType = useDeviceType();
  const [dbSub, setDbSub] = useState<Sub>();

  const setPushToken = async (token: string) => {
    const deviceId = getDeviceId();
    const newSub = await persistAppTokenAction(token, deviceType, deviceId);
    toast("Notifications enabled!");
    setDbSub(newSub);
  };

  useEffect(() => {
    // Get current settings
    const getNotificationSettings = async () => {
      const deviceId = getDeviceId();
      const sub = await getSubAction(deviceId);
      setDbSub(sub);
    };
    getNotificationSettings();

    // Make the setPushToken "publicly" available so the iOS/Android app can use it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).setPushToken = setPushToken;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).setPushToken;
    };
  }, []);

  async function subscribeToPush() {
    const permission = await askPermission();
    if (permission !== "granted") {
      toast.error(`Permission not granted: ${permission}`);
      return;
    }
  }

  if (!NOTIFICATION_DEVICES.includes(deviceType)) {
    return (
      <div>
        <p>Install as an app to get notifications</p>
        <p>
          <Link
            href="https://play.google.com/store/apps/details?id=cc.cowleyroadcondors.ride&hl=en_GB"
            className="text-primary hover:underline"
          >
            Android
          </Link>
        </p>
        <p>iPhone version coming soon</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {!dbSub && (
        <Button
          variant="outline"
          extra="action"
          className="w-full md:w-fit"
          onClick={subscribeToPush}
        >
          Enable
        </Button>
      )}

      {dbSub && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={dbSub.rideUpdate}
              onCheckedChange={async (value) => {
                if (value !== "indeterminate") {
                  const deviceId = getDeviceId();
                  await setRideUpdateNotificationAction(value, deviceId);
                }
              }}
            />
            <p>Get notified of comments and changes to joined rides</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={dbSub.rideNew}
              onCheckedChange={async (value) => {
                if (value !== "indeterminate") {
                  const deviceId = getDeviceId();
                  await setRideNewNotificationAction(value, deviceId);
                }
              }}
            />
            <p>Get notified when new rides created</p>
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationPrompt() {
  const deviceType = useDeviceType();
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  const setPushToken = async (token: string) => {
    const deviceId = getDeviceId();
    await persistAppTokenAction(token, deviceType, deviceId);
    toast("Notifications enabled!");
    setShowPrompt(false);
  };

  useEffect(() => {
    // Get current settings
    const getNotificationSettings = async () => {
      const deviceId = getDeviceId();
      const sub = await getSubAction(deviceId);
      setShowPrompt(sub === undefined);
    };
    if (NOTIFICATION_DEVICES.includes(deviceType)) {
      getNotificationSettings();
    }

    // Make the setPushToken "publicly" available so the iOS/Android app can use it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).setPushToken = setPushToken;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).setPushToken;
    };
  }, []);

  const onClick = async () => {
    await askPermission();
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <H3>Get notified!</H3>
        <p className="text-muted-foreground">You got the app, now enable notifications</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" extra="action" className="w-full md:w-fit" onClick={onClick}>
          Enable ride notifications
        </Button>
        <p className="text-soft">
          You can always manage your{" "}
          <Link href="/settings" className="text-primary">
            settings
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
