import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const db = await Database.load('sqlite:runner.db');

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS factions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      faction_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      quest_id TEXT,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      intent_note TEXT NOT NULL DEFAULT '',
      debrief_note TEXT NOT NULL DEFAULT '',
      rating INTEGER,
      xp_target INTEGER NOT NULL DEFAULT 50,
      xp_earned INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Migration: add xp columns if they don't exist yet (for existing DBs)
  try { await db.execute('ALTER TABLE runs ADD COLUMN xp_target INTEGER NOT NULL DEFAULT 50'); } catch (_) {}
  try { await db.execute('ALTER TABLE runs ADD COLUMN xp_earned INTEGER NOT NULL DEFAULT 0'); } catch (_) {}

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contract_items (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      xp INTEGER NOT NULL DEFAULT 50
    )
  `);
  try { await db.execute('ALTER TABLE contract_items ADD COLUMN xp INTEGER NOT NULL DEFAULT 50'); } catch (_) {}

  // Seed factions
  const factions = [
    { id: 'CYAC', name: 'CYAC', color: '#00c8b4' },
    { id: 'NUCAL', name: 'NUCAL', color: '#aaff00' },
    { id: 'TRAXUS', name: 'TRAXUS', color: '#ff8c00' },
    { id: 'MIDA', name: 'MIDA', color: '#ff3b30' },
    { id: 'ARACHNE', name: 'ARACHNE', color: '#9b59b6' },
    { id: 'SEKGEN', name: 'SEKGEN', color: '#4a9eff' },
  ];

  for (const faction of factions) {
    await db.execute(
      'INSERT OR IGNORE INTO factions (id, name, color) VALUES (?, ?, ?)',
      [faction.id, faction.name, faction.color]
    );
  }

  dbInstance = db;
  return db;
}

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    return await initDatabase();
  }
  return dbInstance;
}

export default getDb;
