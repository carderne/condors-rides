"use client";

import { getSubAction, persistAppTokenAction } from "@/components/pwa/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H3 } from "@/components/ui/typography";
import { getDeviceId } from "@/hooks/client-id";
import { getDeviceType } from "@/hooks/device-type";
import { askPermission } from "@/lib/notifications";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PROMPT_DEVICES = ["android-app", "ios-app"];

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);

  const setPushToken = async (token: string) => {
    const deviceType = getDeviceType();
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
    const deviceType = getDeviceType();
    if (PROMPT_DEVICES.includes(deviceType)) {
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
