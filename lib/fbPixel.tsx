'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Hybrid Tracking Function
export const trackFbEvent = async (
  eventName: string,
  customData: any = {},
  userData: any = {}
) => {
  // Generate a unique ID to deduplicate the Browser and Server events
  const eventId = crypto.randomUUID(); 

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
        sourceUrl: window.location.href,
      }),
    });
  } catch (err) {
    console.error('Failed to trigger CAPI event', err);
  }
};

// Base Pixel Component
export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track standard page views
    if (typeof window !== 'undefined' && (window as any).fbq) {
      trackFbEvent('PageView');
    }
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID) return null;

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
        `,
      }}
    />
  );
}