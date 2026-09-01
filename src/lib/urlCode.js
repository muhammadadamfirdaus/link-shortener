import { customAlphabet } from 'nanoid';
import getDb from './db';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const CODE_LENGTH = 6;
const nanoid = customAlphabet(ALPHABET, CODE_LENGTH);

const RESERVED = new Set(['api', '_next', 'link', 'favicon.ico', 'robots.txt', 'sitemap.xml']);

export function urlCodeValidate(code) {
  return /^[A-Za-z0-9_-]{3,32}$/.test(code) && !RESERVED.has(code);
}

export function urlCodeGenerate() {
  const exists = getDb().prepare('SELECT 1 FROM links WHERE url_code = ?');
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = nanoid();
    if (!exists.get(code)) return code;
  }
  throw new Error('urlCodeGenerate: exhausted retries');
}