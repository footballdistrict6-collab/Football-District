import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, customData, userData, sourceUrl } = body;

    const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const TOKEN = process.env.FB_CONVERSIONS_API_TOKEN;

    if (!PIXEL_ID || !TOKEN) {
      return NextResponse.json({ error: 'Missing Meta Pixel credentials' }, { status: 500 });
    }

    // Extract headers for better event matching
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Meta requires PII like email/phone to be SHA256 hashed
    const hashData = (data: string) => crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');

    const formattedUserData: any = {
      client_ip_address: ip.split(',')[0],
      client_user_agent: userAgent,
    };

    if (userData?.email) formattedUserData.em = [hashData(userData.email)];
    if (userData?.phone) formattedUserData.ph = [hashData(userData.phone)];
    if (userData?.firstName) formattedUserData.fn = [hashData(userData.firstName)];
    if (userData?.lastName) formattedUserData.ln = [hashData(userData.lastName)];

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventId, // CRITICAL FOR DEDUPLICATION
          event_source_url: sourceUrl,
          user_data: formattedUserData,
          custom_data: customData,
        },
      ],
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const metaResponse = await response.json();
    return NextResponse.json({ success: true, metaResponse });

  } catch (error) {
    console.error('CAPI Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}