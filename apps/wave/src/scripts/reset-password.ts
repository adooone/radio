import readline from 'node:readline';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

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

const resetPassword = async () => {
  try {
    console.log('🔐 Password Reset Tool');
    console.log('====================');
    console.log('');

    // Show existing users
    const allUsers = await db
      .select({
        username: accounts.username,
        role: accounts.role,
      })
      .from(accounts);

    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👥 Available users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.role}`);
    });
    console.log('');

    const username = await prompt('Enter username to reset password: ');
    const newPassword = await prompt('Enter new password (min 8 characters): ');

    if (newPassword.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      return;
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    const result = await db
      .update(accounts)
      .set({
        passwordHash,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(accounts.username, username))
      .returning();

    if (result.length === 0) {
      console.log('❌ User not found:', username);
      return;
    }

    const updatedUser = result[0];
    console.log('✅ Password reset successfully!');
    console.log('👤 Username:', updatedUser.username);
    console.log('🔑 New password:', newPassword);
    console.log('');
    console.log('🚀 User can now login with the new password');
  } catch (error) {
    console.error('❌ Failed to reset password:', error);
  } finally {
    rl.close();
    process.exit(0);
  }
};

resetPassword();
