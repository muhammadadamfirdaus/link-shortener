import { headers } from 'next/headers';
import getDb from '@/lib/db';
import ButtonCopy from './components/ButtonCopy';

export const dynamic = 'force-dynamic';

export default async function LinkIndexPage() {
  const headersList = await headers();
  const host = headersList.get('host');

  const links = getDb()
    .prepare('SELECT url_code, url_destination, hit_count FROM links ORDER BY created_at DESC')
    .all();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Links</h1>
      {links.length === 0 ? (
        <p className="text-gray-500">No links yet.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((link) => (
            <li key={link.url_code} className="flex items-center justify-between rounded border p-3">
              <div className="min-w-0">
                <p className="font-mono">
                  {host}/{link.url_code}
                </p>
                <p className="truncate text-sm text-gray-500">{link.url_destination}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <ButtonCopy text={`https://${host}/${link.url_code}`} />
                <a
                  href={`/${link.url_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border px-3 py-1 text-sm"
                >
                  Open
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <a href="/link/create" className="mt-6 inline-block text-sm underline">
        Create a link
      </a>
    </main>
  );
}