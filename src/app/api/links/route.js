import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getDb from '@/lib/db';
import { urlCodeGenerate, urlCodeValidate } from '@/lib/urlCode';
import { sessionVerify, SESSION_COOKIE_NAME } from '@/lib/session';
import { rateLimitCheck, clientIp } from '@/lib/rateLimit';

function urlDestinationValidate(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request) {
  const ip = clientIp(request);

  if (!rateLimitCheck(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionVerify(sessionCookie)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !urlDestinationValidate(body.urlDestination)) {
    return NextResponse.json({ error: 'invalid_destination' }, { status: 400 });
  }

  let urlCode = body.urlCode || null;
  if (urlCode) {
    if (!urlCodeValidate(urlCode)) {
      return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
    }
    const taken = getDb().prepare('SELECT 1 FROM links WHERE url_code = ?').get(urlCode);
    if (taken) {
      return NextResponse.json({ error: 'code_taken' }, { status: 409 });
    }
  } else {
    urlCode = urlCodeGenerate();
  }

  getDb().prepare('INSERT INTO links (url_code, url_destination) VALUES (?, ?)').run(urlCode, body.urlDestination);

  const urlShort = `https://${request.headers.get('host')}/${urlCode}`;

  return NextResponse.json({ urlCode, urlShort, urlDestination: body.urlDestination }, { status: 201 });
}