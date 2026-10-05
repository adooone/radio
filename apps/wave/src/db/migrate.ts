import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { backupDatabaseBeforeMigration } from './backup';
import { db } from './db';

// Backup before migrating so we can restore if something goes wrong
backupDatabaseBeforeMigration();

migrate(db, {
  migrationsFolder: './drizzle',
});

console.log('✅ Database migrated!');
