"use client";

import { useEffect } from "react";

/**
 * OneSignal Web Push — initializare conditionata de cookie consent.
 *
 * Setup (o singura data):
 *  1. Creeaza cont gratuit la onesignal.com
 *  2. Add App → Web → Site URL: https://amcupon.ro
 *  3. Copiaza App ID din Settings → Keys & IDs
 *  4. Adauga in Vercel: NEXT_PUBLIC_ONESIGNAL_APP_ID = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 */

declare global {
  interface Window {
    OneSignalDeferred?: ((os: unknown) => void | Promise<void>)[];
  }
}

interface Props {
  appId?: string;
}

export default function WebPushInit({ appId }: Props) {
  useEffect(() => {
    if (!appId) return;

    // Incarca SDK-ul OneSignal doar daca nu e deja incarcat
    if (document.getElementById("onesignal-sdk")) return;

    const script = document.createElement("script");
    script.id    = "onesignal-sdk";
    script.src   = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: unknown) => {
        const os = OneSignal as {
          init: (opts: object) => Promise<void>;
        };
        await os.init({
          appId,
          notifyButton:         { enable: false },
          welcomeNotification:  {
            disable: false,
            title:   "AmCupon.ro",
            message: "Vei primi alerte cu cele mai bune oferte!",
          },
          promptOptions: {
            slidedown: {
              prompts: [{
                type:       "push",
                autoPrompt: true,
                text: {
                  actionMessage: "Primeste coduri de reducere direct in browser — gratis si fara spam!",
                  acceptButton:  "Da, vreau!",
                  cancelButton:  "Nu acum",
                },
                delay: {
                  pageViews: 2,   // apare dupa 2 vizite
                  timeDelay:  20, // secunde dupa incarcarea paginii
                },
              }],
            },
          },
        });
      });
    };
    document.head.appendChild(script);
  }, [appId]);

  return null;
}
