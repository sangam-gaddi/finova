import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roomName = body?.roomName || `finova-aria-${Date.now()}`;
    const participantName = body?.participantName || `user-${Date.now()}`;
    const metadata = body?.metadata || '{}';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !serverUrl) {
      return NextResponse.json(
        {
          error:
            'LiveKit is not configured. Required: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL or NEXT_PUBLIC_LIVEKIT_URL.',
        },
        { status: 500 },
      );
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata,
      ttl: '15m',
    });

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    const participantToken = await at.toJwt();

    return NextResponse.json(
      { serverUrl, roomName, participantToken },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: any) {
    console.error('ARIA connection-details error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate ARIA connection details' }, { status: 500 });
  }
}
