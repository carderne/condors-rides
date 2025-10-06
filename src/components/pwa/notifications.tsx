"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Sub } from "@/db/zod";
import { getDeviceId } from "@/hooks/client-id";
import { getDeviceType, useDeviceType } from "@/hooks/device-type";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getSub,
  persistAppTokenAction,
  setRideNewNotificationAction,
  setRideUpdateNotificationAction,
  subscribeUserAction,
  unsubscribeUserAction,
} from "./actions";

export function PushNotificationManager() {
  const deviceType = useDeviceType();
  const [pwaNotificationSupported, setPwaNotificationIsSupported] = useState(false);
  const [dbSub, setDbSub] = useState<Sub>();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const router = useRouter();

  const setPushToken = async (token: string) => {
    const deviceType = getDeviceType();
    const deviceId = getDeviceId();
    const res = await persistAppTokenAction(token, deviceType, deviceId);
    if (res.success) {
      toast("Notifications enabled!");
      router.refresh();
    } else {
      toast.warning("Error: notifications not enabled");
    }
  };

  useEffect(() => {
    // Get current settings
    const getNotificationSettings = async () => {
      const deviceId = getDeviceId();
      const sub = await getSub(deviceId);
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

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPwaNotificationIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUserAction();
  }

  async function subscribeToPush() {
    console.log("SUBSCRIBE TO PUSH AAAAAA");
    const permission = await askPermission();
    console.log("SUBSCRIBE TO PUSH BBBBBB");
    if (permission !== "granted") {
      console.log("SUBSCRIBE TO PUSH CCCCCC");
      toast.error(`Permission not granted: ${permission}`);
      return;
    }
    console.log("SUBSCRIBE TO PUSH DDDDDD");
    const registration = await navigator.serviceWorker.ready;

    if (registration.pushManager === undefined) {
      console.log("SUBSCRIBE TO PUSH EEEEEE");
      // Presumably using a real app?
      // Stop silently?!
      return;
    }
    console.log("SUBSCRIBE TO PUSH FFFFFF");
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    const deviceId = getDeviceId();
    const serializedSub = JSON.parse(JSON.stringify(sub));
    const res = await subscribeUserAction(serializedSub, deviceType, deviceId);
    // Just doing this because the revalidatePath doesn't seem to work (on PWA?)
    if (res.success) {
      const deviceId = getDeviceId();
      const sub = await getSub(deviceId);
      setDbSub(sub);
    }
  }

  if (!pwaNotificationSupported && !["android-app", "ios-app"].includes(deviceType)) {
    return "Install as an app to get notifications (see below).";
  }

  if (["chrome", "other"].includes(deviceType)) {
    return "Notifications only enabled for mobile app.";
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

      {subscription && (
        <Button
          variant="outline"
          extra="action"
          className="w-full md:w-fit"
          onClick={unsubscribeFromPush}
        >
          Disable
        </Button>
      )}

      {dbSub && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={dbSub.rideUpdate}
              onCheckedChange={async (value) => {
                if (value !== "indeterminate") {
                  await setRideUpdateNotificationAction(value);
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
                  await setRideNewNotificationAction(value);
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

async function askPermission(): Promise<"granted" | "denied" | "default"> {
  const permissionResult = await new Promise<"granted" | "denied" | "default">(
    (resolve, reject) => {
      const maybePromise = Notification.requestPermission((result) => {
        resolve(result);
      });

      if (maybePromise) {
        maybePromise.then(resolve, reject);
      }
    },
  );

  return permissionResult;
}
