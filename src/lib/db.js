import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

let db = null;

export default function getDb() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || './local.db';
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      url_code        TEXT NOT NULL UNIQUE,
      url_destination TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      hit_count       INTEGER NOT NULL DEFAULT 0,
      hit_at          TEXT
    )
  `);

  return db;
}