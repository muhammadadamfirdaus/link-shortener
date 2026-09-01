import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function LinkIndexPage() {
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
                <p className="font-mono">/{link.url_code}</p>
                <p className="truncate text-sm text-gray-500">{link.url_destination}</p>
              </div>
              <a
                href={`/${link.url_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded border px-3 py-1 text-sm"
              >
                Open
              </a>
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