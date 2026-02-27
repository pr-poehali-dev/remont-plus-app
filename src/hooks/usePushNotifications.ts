import { useState, useEffect } from "react";

const SUBSCRIBE_URL = "https://functions.poehali.dev/6bb32b70-03d3-498b-bd7b-61be161f3f58";
// Публичный VAPID-ключ — подставьте после генерации
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushState = "idle" | "subscribing" | "subscribed" | "denied" | "unsupported";

export function usePushNotifications() {
  const [state, setState] = useState<PushState>("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") setState("denied");
    if (localStorage.getItem("push-subscribed")) setState("subscribed");
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    setState("subscribing");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const key = sub.getKey("p256dh");
      const authKey = sub.getKey("auth");
      if (!key || !authKey) throw new Error("No keys");

      await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
          auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
        }),
      });

      localStorage.setItem("push-subscribed", "1");
      setState("subscribed");
    } catch {
      if (Notification.permission === "denied") setState("denied");
      else setState("idle");
    }
  };

  return { state, subscribe };
}
