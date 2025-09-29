"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { User } from "@/db/zod";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  setNewRideNotificationAction,
  subscribeUserAction,
  unsubscribeUserAction,
} from "./actions";

export function PushNotificationManager({ user }: { user: User }) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
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

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUserAction(serializedSub);
    } catch (err) {
      const description = err instanceof Error ? err.message : "";
      toast.error("Failed to subscribe", { description });
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUserAction();
  }

  if (!isSupported) {
    return "Install as an app to get notifications (see below).";
  }

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        extra="action"
        className="w-full md:w-fit"
        onClick={subscription ? unsubscribeFromPush : subscribeToPush}
      >
        {subscription ? "Disable" : "Enable"}
      </Button>

      {subscription && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox checked={true} disabled={true} />
            <p>Get notified of comments and changes to joined rides</p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={user.notifyNewRide}
              onCheckedChange={async (value) => {
                if (value !== "indeterminate") {
                  await setNewRideNotificationAction(value);
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
