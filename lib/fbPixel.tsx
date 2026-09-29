'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1722417688864625';

// Hybrid Tracking Function (Client-side Browser Pixel + Server-side CAPI)
export const trackFbEvent = async (
  eventName: string,
  customData: any = {},
  userData: any = {}
) => {
  // Generate a unique ID to deduplicate the Browser and Server events
  const eventId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; 

  // 1. Fire Client-Side (Browser)
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, customData, { eventID: eventId });
  }

  // 2. Fire Server-Side (CAPI)
  try {
    await fetch('/api/fb-conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        userData,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
      }),
    });
  } catch (err) {
    console.error('Failed to trigger CAPI event', err);
  }
};

// Route Change Listener for Next.js SPA navigation
export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip tracking on initial mount because the head script already executes fbq('track', 'PageView')
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Track standard page views on subsequent SPA route changes
    if (typeof window !== 'undefined' && (window as any).fbq) {
      trackFbEvent('PageView');
    }
  }, [pathname, searchParams]);

  return null;
}