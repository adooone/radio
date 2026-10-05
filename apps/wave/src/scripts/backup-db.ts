import { writeFileSync } from 'node:fs';
import { db } from '@/db';
import {
  accounts,
  audioFiles,
  collectionItems,
  collections,
  sessions,
} from '@/db/schema';

const backupDatabase = async () => {
  try {
    console.log('💾 Creating database backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `data/backup-${timestamp}.json`;

    // Export all tables
    const [
      accountsData,
      collectionsData,
      audioFilesData,
      collectionItemsData,
      sessionsData,
    ] = await Promise.all([
      db.select().from(accounts),
      db.select().from(collections),
      db.select().from(audioFiles),
      db.select().from(collectionItems),
      db.select().from(sessions),
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      tables: {
        accounts: accountsData,
        collections: collectionsData,
        audioFiles: audioFilesData,
        collectionItems: collectionItemsData,
        sessions: sessionsData,
      },
      stats: {
        accounts: accountsData.length,
        collections: collectionsData.length,
        audioFiles: audioFilesData.length,
        collectionItems: collectionItemsData.length,
        sessions: sessionsData.length,
      },
    };

    // Write backup file
    writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log('✅ Database backup created successfully!');
    console.log('📁 File:', backupFile);
    console.log('📊 Statistics:');
    console.log(`   - Accounts: ${backup.stats.accounts}`);
    console.log(`   - Collections: ${backup.stats.collections}`);
    console.log(`   - Audio Files: ${backup.stats.audioFiles}`);
    console.log(`   - Collection Items: ${backup.stats.collectionItems}`);
    console.log(`   - Sessions: ${backup.stats.sessions}`);
    console.log('');
    console.log('💡 To restore, use the restore-db script');
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
  } finally {
    process.exit(0);
  }
};

backupDatabase();
