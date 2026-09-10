import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Input } from '@dendelion/mojo-ui';
import { useLogin } from '@/services/api/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { sharedStyles } from '@/styles/shared-styles';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const login = useLogin();
  const { isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      await login.mutateAsync({ username: username.trim(), password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background image with blur */}
      <div className="absolute inset-0">
        <img
          src="/login-bg.jpg"
          alt="Background"
          className="w-full h-full object-cover blur-sm"
        />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 rounded-2xl bg-gray-900/25 backdrop-blur-2xl border border-white/5 p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none before:rounded-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-sun mb-2 tracking-wide">
            Wave Admin
          </h1>
          <p className="text-gray-300">
            Sign in to manage your radio collections
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="username"
            label="Username"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-amber-400/60 hover:text-amber-400 transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            }
          />

          {login.error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
              {login.error instanceof Error
                ? login.error.message
                : 'Login failed. Please check your credentials.'}
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!username.trim() || !password.trim() || isLoading}
              className={clsx(sharedStyles.buttonPrimary)}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/60">
            Need an account?{' '}
            <button
              type="button"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              onClick={() => {
                alert(
                  'Registration is currently disabled. Please contact an administrator.',
                );
              }}
            >
              Contact Admin
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
