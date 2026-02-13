"use client";

import { useEffect } from "react";

export const PwaServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Failed to register service worker", error);
      });
    }
  }, []);

  return null;
};
