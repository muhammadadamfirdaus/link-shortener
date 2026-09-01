import { NextResponse } from 'next/server';
import { passcodeVerify } from '@/lib/passcode';
import { captchaVerify } from '@/lib/captcha';
import { sessionCreate } from '@/lib/session';
import { rateLimitCheck, clientIp } from '@/lib/rateLimit';

export async function POST(request) {
  const ip = clientIp(request);

  if (!rateLimitCheck(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  if (!passcodeVerify(body.passcode)) {
    console.log(JSON.stringify({ ip, timestamp: new Date().toISOString(), outcome: 'passcode_invalid' }));
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!(await captchaVerify(body.captchaToken, ip))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const cookie = sessionCreate();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: cookie.maxAge,
    path: '/',
  });

  return response;
}