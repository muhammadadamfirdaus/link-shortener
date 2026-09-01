import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request, { params }) {
  const { urlCode } = await params;

  const row = getDb().prepare('SELECT url_destination FROM links WHERE url_code = ?').get(urlCode);
  if (!row) {
    return new NextResponse('Not found', { status: 404 });
  }

  getDb()
    .prepare("UPDATE links SET hit_count = hit_count + 1, hit_at = datetime('now') WHERE url_code = ?")
    .run(urlCode);

  return NextResponse.redirect(row.url_destination, 302);
}