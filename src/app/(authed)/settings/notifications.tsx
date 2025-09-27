"use client";

import { Button } from "@/components/ui/button";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "./actions";

export function PushNotificationManager() {
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
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  if (!isSupported) {
    return "Install it as an app to get notifications!";
  }

  return (
    <div>
      {subscription ? (
        <Button
          variant="outline"
          extra="action"
          className="w-full md:w-fit"
          onClick={unsubscribeFromPush}
        >
          Disable
        </Button>
      ) : (
        <Button
          variant="outline"
          extra="action"
          className="w-full md:w-fit"
          onClick={subscribeToPush}
        >
          Enable
        </Button>
      )}
    </div>
  );
}
