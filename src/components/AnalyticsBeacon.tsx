'use client';

import { useEffect } from 'react';

type IdleCallbackHandle = number;
type IdleCallbackOptions = { timeout?: number };
type IdleDeadline = { readonly didTimeout: boolean; timeRemaining(): number };

type IdleWindow = Window & {
  requestIdleCallback?: (callback: (deadline: IdleDeadline) => void, opts?: IdleCallbackOptions) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export default function AnalyticsBeacon() {
  useEffect(() => {
    const body = {
      page: window.location.pathname,
      query: window.location.search || '',
      referrer: document.referrer || undefined,
      screenW: window.screen?.width,
      screenH: window.screen?.height,
      dpr: window.devicePixelRatio || 1,
      language: navigator.language || (navigator as any).userLanguage,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent,
      platform: (navigator as any).userAgentData?.platform,
    };

    let controller: AbortController | undefined;

    const send = () => {
      try {
        const payload = JSON.stringify(body);
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/track/visit', blob);
        } else {
          controller = new AbortController();
          fetch('/api/track/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            cache: 'no-store',
            body: payload,
            signal: controller.signal,
          }).catch(() => controller?.abort());
        }
      } catch (err) {
        // Swallow errors; analytics should never impact UX
      }
    };

    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const handle = idleWindow.requestIdleCallback(send, { timeout: 2000 });
      return () => {
        if (typeof idleWindow.cancelIdleCallback === 'function') {
          idleWindow.cancelIdleCallback(handle);
        }
        controller?.abort();
      };
    }

    const timeout = window.setTimeout(send, 400);
    return () => {
      window.clearTimeout(timeout);
      controller?.abort();
    };
  }, []);

  return null;
}
