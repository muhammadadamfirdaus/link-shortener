'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function FormUrl() {
  const router = useRouter();
  const [urlDestination, setUrlDestination] = useState('');
  const [urlCode, setUrlCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    const response = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlDestination, urlCode: urlCode || undefined }),
    });

    const data = await response.json().catch(() => null);
    setSubmitting(false);

    if (!response.ok) {
      setError(data?.error || 'Something went wrong.');
      return;
    }

    setResult(data);
    setUrlDestination('');
    setUrlCode('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-semibold">Create a link</h1>
      <input
        type="url"
        value={urlDestination}
        onChange={(event) => setUrlDestination(event.target.value)}
        placeholder="https://example.com/page"
        className="w-full rounded border p-2"
        required
      />
      <input
        type="text"
        value={urlCode}
        onChange={(event) => setUrlCode(event.target.value)}
        placeholder="Custom code (optional)"
        className="w-full rounded border p-2"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && (
        <p className="break-all text-sm text-green-600">
          Created:{' '}
          <a href={result.urlShort} target="_blank" rel="noopener noreferrer" className="underline">
            {result.urlShort}
          </a>
        </p>
      )}
      <button type="submit" disabled={submitting} className="w-full rounded border p-2">
        {submitting ? 'Creating...' : 'Create'}
      </button>
      <a href="/link" className="block text-center text-sm underline">
        View all links
      </a>
    </form>
  );
}

export default FormUrl;