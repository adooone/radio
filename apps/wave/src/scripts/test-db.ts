import { db } from '@/db';
import { createAccount, findAccountByEmail } from '@/db/accounts';
import { createCollection, findCollectionsByOwner } from '@/db/collections';
import {
  createAudioFile,
  findAudioFilesByUploader,
} from '@/db/collections/audioFiles';
import {
  addToCollection,
  getCollectionItems,
} from '@/db/collections/collectionItems';

const testDatabase = async () => {
  try {
    console.log('🧪 Testing database setup...');

    const timestamp = Date.now();

    // Test account creation
    console.log('📝 Creating test account...');
    await createAccount({
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      passwordHash: 'hashedpassword123',
      role: 'user',
    });
    console.log('✅ Account created');

    // Test collection creation
    console.log('📁 Creating test collection...');
    await createCollection({
      name: `My Test Collection ${timestamp}`,
      description: 'A test collection for audio files',
      isPublic: false,
      ownerId: 1, // Assuming the account gets ID 1
    });
    console.log('✅ Collection created');

    // Test audio file creation
    console.log('🎵 Creating test audio file...');
    await createAudioFile({
      name: `test-song_${timestamp}.mp3`,
      path: `/data/audio/test-song_${timestamp}.mp3`,
      duration: '180.5',
      size: 1024000,
      format: 'mp3',
      uploadedBy: 1,
      metadata: JSON.stringify({ artist: 'Test Artist', album: 'Test Album' }),
    });
    console.log('✅ Audio file created');

    // Test queries
    console.log('🔍 Testing queries...');
    const foundAccount = await findAccountByEmail(
      `test_${timestamp}@example.com`,
    );
    console.log('✅ Found account:', foundAccount?.username);

    const userCollections = await findCollectionsByOwner(1);
    console.log('✅ User collections:', userCollections.length);

    const userAudioFiles = await findAudioFilesByUploader(1);
    console.log('✅ User audio files:', userAudioFiles.length);

    // Test collection items
    console.log('🔗 Adding audio file to collection...');
    await addToCollection({
      collectionId: 1,
      audioFileId: 1,
      order: 0,
    });
    console.log('✅ Collection item added');

    const collectionItems = await getCollectionItems(1);
    console.log('✅ Collection items:', collectionItems.length);

    console.log('🎉 Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
};

testDatabase();
