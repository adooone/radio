import { eq } from 'drizzle-orm';
import { db } from '../db/db';
import { accounts, albums, audioFiles, songs } from '../db/schema';

console.log('🧪 Testing Albums and Songs Schema...\n');

const testAlbumsSchema = async () => {
  try {
    console.log('📊 Checking tables exist...');

    const existingAccounts = db.select().from(accounts).limit(1).all();
    console.log(`✅ Accounts table: ${existingAccounts.length} records found`);

    const existingAudioFiles = db.select().from(audioFiles).limit(1).all();
    console.log(
      `✅ Audio files table: ${existingAudioFiles.length} records found`,
    );

    const existingAlbums = db.select().from(albums).limit(1).all();
    console.log(`✅ Albums table: ${existingAlbums.length} records found`);

    const existingSongs = db.select().from(songs).limit(1).all();
    console.log(`✅ Songs table: ${existingSongs.length} records found\n`);

    if (existingAccounts.length === 0) {
      console.log(
        '⚠️  No accounts found. Please create an account first using `bun run admin`',
      );
      return;
    }

    const testAccount = existingAccounts[0];
    console.log(
      `📝 Using test account: ${testAccount.username} (ID: ${testAccount.id})\n`,
    );

    console.log('🎵 Creating test album...');
    const albumResult = db
      .insert(albums)
      .values({
        title: 'Test Album',
        artist: 'Test Artist',
        year: 2024,
        description: 'Test album for schema validation',
        tags: JSON.stringify(['Rock', 'Indie']),
        isPublic: 1,
        ownerId: testAccount.id,
      })
      .returning({ id: albums.id })
      .get();

    console.log(`✅ Album created with ID: ${albumResult.id}`);

    if (existingAudioFiles.length > 0) {
      const testAudioFile = existingAudioFiles[0];
      console.log(
        `\n🎼 Creating test song with audio file ID: ${testAudioFile.id}...`,
      );

      const songResult = db
        .insert(songs)
        .values({
          albumId: albumResult.id,
          audioFileId: testAudioFile.id,
          trackNumber: 1,
          title: 'Test Song',
          artist: 'Test Artist',
          duration: testAudioFile.duration,
          format: testAudioFile.format,
        })
        .returning({ id: songs.id })
        .get();

      console.log(`✅ Song created with ID: ${songResult.id}`);
    } else {
      console.log(
        '\n⚠️  No audio files found. Upload an audio file to test song creation.',
      );
    }

    console.log('\n🔍 Verifying album data...');
    const createdAlbum = db
      .select()
      .from(albums)
      .where(eq(albums.id, albumResult.id))
      .get();

    console.log('✅ Album found:', {
      id: createdAlbum?.id,
      title: createdAlbum?.title,
      artist: createdAlbum?.artist,
      year: createdAlbum?.year,
      isPublic: createdAlbum?.isPublic,
    });

    console.log('\n🧹 Cleaning up test data...');
    db.delete(albums).where(eq(albums.id, albumResult.id)).run();
    console.log('✅ Test album deleted');

    console.log('\n✅ All schema tests passed!');
  } catch (error) {
    console.error('\n❌ Schema test failed:', error);
    throw error;
  }
};

testAlbumsSchema();
