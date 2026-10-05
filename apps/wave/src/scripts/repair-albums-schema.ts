/**
 * Repairs the albums table after a failed migration.
 * The migration 0005 created albums_new but didn't complete (drop old, rename).
 * Both tables are empty, so we complete the migration by swapping them.
 */
import { Database } from 'bun:sqlite';
import { join } from 'node:path';

const dbPath = join(import.meta.dir, '../../data/wave.sqlite');
const db = new Database(dbPath);

console.log('🔧 Repairing albums schema...\n');

try {
  // Check if albums_new exists (from partial migration)
  const tables = db
    .query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('albums', 'albums_new')",
    )
    .all() as { name: string }[];

  const hasAlbums = tables.some((t) => t.name === 'albums');
  const hasAlbumsNew = tables.some((t) => t.name === 'albums_new');

  if (!hasAlbumsNew) {
    console.log(
      '✅ No orphan albums_new table - schema may already be correct.',
    );
    process.exit(0);
  }

  db.exec('BEGIN TRANSACTION');

  try {
    // Step 1: Drop old albums table
    db.exec('DROP TABLE IF EXISTS albums');
    console.log('✓ Dropped old albums table');

    // Step 2: Rename albums_new to albums
    db.exec('ALTER TABLE albums_new RENAME TO albums');
    console.log('✓ Renamed albums_new to albums');

    // Step 3: Recreate unique index on folder_slug
    db.exec(
      'CREATE UNIQUE INDEX IF NOT EXISTS albums_folder_slug_unique ON albums (folder_slug)',
    );
    console.log('✓ Recreated folder_slug unique index');

    db.exec('COMMIT');
    console.log('\n✅ Albums schema repaired successfully!');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
} catch (error) {
  console.error('❌ Repair failed:', error);
  process.exit(1);
} finally {
  db.close();
}
