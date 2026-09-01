'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

function FormLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const captchaToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode, captchaToken }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError('Invalid passcode or verification failed.');
      return;
    }

    router.refresh();
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-semibold">Log in</h1>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Passcode"
          className="w-full rounded border p-2"
          required
        />
        <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className="w-full rounded border p-2">
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </>
  );
}

export default FormLogin;