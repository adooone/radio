import { db } from '@/db';
import {
  createAccount,
  findAccountByEmail,
  findAccountByUsername,
} from '@/db/accounts';
import { accounts } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Simple prompt function for Bun using readline
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const interactiveAdminCreation = async () => {
  try {
    console.log('🎯 Interactive Admin User Creation');
    console.log('=====================================');
    console.log('');

    // Show existing users first
    console.log('👥 Current users in database:');
    const allUsers = await db
      .select({
        username: accounts.username,
        role: accounts.role,
      })
      .from(accounts);

    if (allUsers.length > 0) {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} - Role: ${user.role}`);
      });
    } else {
      console.log('   No users found');
    }
    console.log('');

    // Ask what to do
    console.log('What would you like to do?');
    console.log('1. Create new admin user');
    console.log('2. Promote existing user to admin');
    console.log('');

    const choice = await prompt('Enter your choice (1 or 2): ');
    console.log('');

    if (choice === '2') {
      // Promote existing user
      const username = await prompt('Enter username to promote to admin: ');

      const existingUser = await findAccountByUsername(username);
      if (!existingUser) {
        console.log('❌ User not found with username:', username);
        return;
      }

      await db
        .update(accounts)
        .set({
          role: 'admin',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(accounts.username, username));

      console.log('✅ User promoted to admin successfully!');
      console.log('👤 Username:', existingUser.username);
      console.log('👑 Role: admin');
      console.log('');
      console.log('🚀 You can now login to the admin panel!');
    } else if (choice === '1') {
      // Create new admin user
      console.log('📝 Creating new admin user...');
      console.log('');

      const username = await prompt('Enter username: ');
      const password = await prompt('Enter password (min 8 characters): ');

      console.log('');
      console.log('Checking for conflicts...');

      // Check if username exists
      const existingUsername = await findAccountByUsername(username);
      if (existingUsername) {
        console.log('❌ Username already exists:', username);
        console.log('💡 Try again with a different username');
        return;
      }

      // Validate password
      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters long');
        return;
      }

      // Create the admin user
      const passwordHash = await bcrypt.hash(password, 12);
      await createAccount({
        username,
        email: `${username}@wave.local`, // Auto-generate email
        passwordHash,
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log('👤 Username:', username);
      console.log('👑 Role: admin');
      console.log('');
      console.log(
        '🚀 You can now login to the admin panel with these credentials!',
      );
      console.log('⚠️  Remember to keep your credentials secure');
    } else {
      console.log(
        '❌ Invalid choice. Please run the script again and choose 1 or 2.',
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

console.log('Starting interactive admin creation...');
interactiveAdminCreation();
