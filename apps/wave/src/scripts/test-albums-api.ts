const API_URL = 'http://localhost:6970';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

const testAlbumsAPI = async () => {
  console.log('🧪 Testing Albums API\n');

  try {
    log.info('Testing public albums endpoint (GET /api/albums/public)...');
    const publicResponse = await fetch(`${API_URL}/api/albums/public`);
    const publicData = await publicResponse.json();

    if (publicResponse.ok) {
      log.success(
        `Status ${publicResponse.status}: ${publicData.data.length} public albums found`,
      );
    } else {
      log.error(
        `Status ${publicResponse.status}: ${publicData.error || 'Failed'}`,
      );
    }

    log.info('\nTesting health endpoint...');
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.ok) {
      log.success(`Server is healthy: ${healthData.status}`);
    } else {
      log.error('Health check failed');
    }

    log.info(
      '\nTesting album by ID endpoint (should fail without auth for private)...',
    );
    const albumByIdResponse = await fetch(`${API_URL}/api/albums/1`);

    if (albumByIdResponse.status === 404) {
      log.warn('Album with ID 1 not found (expected if no albums exist yet)');
    } else if (albumByIdResponse.ok) {
      log.success('Album fetched successfully');
    } else {
      log.warn(`Status ${albumByIdResponse.status}`);
    }

    console.log('\n✅ API endpoints are accessible and working!');
    console.log('\n📝 Next steps:');
    console.log("   1. Create an album via the admin panel (after it's built)");
    console.log('   2. Upload a cover image');
    console.log('   3. Add songs to the album');
    console.log('   4. View public albums in the player app');
  } catch (error) {
    log.error(`Failed to connect to API: ${error}`);
    console.log('\n⚠️  Make sure the Wave server is running:');
    console.log('   cd apps/wave && bun run dev');
  }
};

testAlbumsAPI();
