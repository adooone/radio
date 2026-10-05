import 'dotenv/config';
import readline from 'node:readline';
import { createAccount, findAccountByUsername } from '@/db/accounts';
import bcrypt from 'bcryptjs';

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

const createUser = async () => {
  try {
    console.log('👤 Create new user');
    console.log('================');
    console.log('');

    const username = await prompt('Username: ');
    const password = await prompt('Password (min 8 characters): ');
    const emailInput = await prompt(
      'Email (or press Enter for username@wave.local): ',
    );

    const email = emailInput || `${username}@wave.local`;

    console.log('');
    console.log('Checking...');

    if (!username) {
      console.log('❌ Username is required');
      return;
    }

    const existingUser = await findAccountByUsername(username);
    if (existingUser) {
      console.log('❌ User already exists with username:', username);
      return;
    }

    if (password.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await createAccount({
      username,
      email,
      passwordHash,
      role: 'user',
    });

    console.log('✅ User created successfully!');
    console.log('👤 Username:', username);
    console.log('📧 Email:', email);
    console.log('👤 Role: user');
    console.log('');
    console.log('🚀 User can now login with these credentials.');
  } catch (error) {
    console.error('❌ Failed to create user:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

createUser();
