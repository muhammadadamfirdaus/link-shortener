'use client';

import { useState } from 'react';

function ButtonCopy({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" onClick={handleClick} className="rounded border px-3 py-1 text-sm">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default ButtonCopy;
