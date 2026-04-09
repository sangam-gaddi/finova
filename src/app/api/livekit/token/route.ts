import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName, metadata } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Missing roomName or participantName' },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'LiveKit API credentials missing from server environment' },
        { status: 500 }
      );
    }

    // Generate token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata: metadata || '{}',
    });

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('LiveKit token error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
