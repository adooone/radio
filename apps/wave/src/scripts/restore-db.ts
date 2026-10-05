/**
 * Restore database from the latest pre-migration backup.
 * Use this if a migration went wrong and you need to roll back.
 */
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '@/utils/env';

const BACKUP_DIR = join(process.cwd(), 'data/backups');
const DB_PATH = join(process.cwd(), env.dbFileName);

const restoreFromLatest = () => {
  if (!existsSync(BACKUP_DIR)) {
    console.error(
      '❌ No backups found. Run db:migrate first to create backups.',
    );
    process.exit(1);
  }

  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('wave-pre-migration-') && f.endsWith('.sqlite'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ No pre-migration backups found in', BACKUP_DIR);
    process.exit(1);
  }

  const latest = files[0];
  const backupPath = join(BACKUP_DIR, latest);

  console.log('🔄 Restoring from:', latest);
  copyFileSync(backupPath, DB_PATH);
  console.log('✅ Database restored successfully');
};

restoreFromLatest();
