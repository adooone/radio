import { getSocket } from '@/services/socket';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Available color options from the design system
export const NICKNAME_COLOR_OPTIONS = [
  { name: 'Мох', value: 'text-moss', preview: '#8aa982' },
  { name: 'Мох (глибокий)', value: 'text-moss-deep', preview: '#5c7459' },
  { name: 'Ріка', value: 'text-river', preview: '#4b9ac3' },
  { name: 'Ріка (глибока)', value: 'text-river-deep', preview: '#2f6d91' },
  { name: 'Глина', value: 'text-clay', preview: '#f0a596' },
  { name: 'Глина (глибока)', value: 'text-clay-deep', preview: '#d78878' },
  { name: 'Сонце', value: 'text-sun', preview: '#ff9f1c' },
  { name: 'Сонце (глибоке)', value: 'text-sun-deep', preview: '#ff6f00' },
  { name: 'Жаринка', value: 'text-ember', preview: '#e4572e' },
  { name: 'Жаринка (глибока)', value: 'text-ember-deep', preview: '#bc4b26' },
  { name: 'Кора', value: 'text-bark', preview: '#a18763' },
  { name: 'Папір (акцент)', value: 'text-paper-accent', preview: '#F49517' },
] as const;

// Helper function to generate consistent color for any nickname
export const generateNicknameColor = (nickname: string): string => {
  if (!nickname) return 'text-moss';

  const colors = NICKNAME_COLOR_OPTIONS.map((option) => option.value);

  // Generate a simple hash from the nickname to ensure consistency
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    const char = nickname.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

type UserColor = {
  nickname: string;
  color: string | null; // null means auto mode
  updatedAt: number;
};

type UserColorsState = {
  // Current user's color preference (persisted)
  myColor: string | null; // null means auto mode

  // Other users' colors (ephemeral, from socket)
  otherUsersColors: Map<string, UserColor>;
};

type UserColorsActions = {
  // Current user actions
  setMyColor: (color: string | null) => void;
  resetMyColorToAuto: () => void;
  isMyColorAuto: () => boolean;

  // Other users management
  setUserColor: (nickname: string, color: string | null) => void;
  removeUser: (nickname: string) => void;
  clearAllOtherUsers: () => void;

  // Universal getters
  getEffectiveColor: (nickname: string, isCurrentUser?: boolean) => string;
  getUserColor: (nickname: string) => string | null;
};

// Helper function to send color update via socket
const sendColorUpdate = (color: string | null) => {
  try {
    const nickname = localStorage.getItem('nickname');
    if (nickname) {
      const ws = getSocket();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'color_update',
            nickname,
            color,
          }),
        );
      }
    }
  } catch (error) {
    // Socket not available or not connected, ignore
    console.warn('Could not send color update:', error);
  }
};

export const useUserColorsStore = create<UserColorsState & UserColorsActions>()(
  persist(
    (set, get) => ({
      // Initial state
      myColor: null,
      otherUsersColors: new Map<string, UserColor>(),

      // Current user actions
      setMyColor: (color) => {
        set({ myColor: color });
        sendColorUpdate(color);
      },

      resetMyColorToAuto: () => {
        set({ myColor: null });
        sendColorUpdate(null);
      },

      isMyColorAuto: () => get().myColor === null,

      // Other users management
      setUserColor: (nickname: string, color: string | null) => {
        set((state) => {
          const newColors = new Map(state.otherUsersColors);
          newColors.set(nickname, {
            nickname,
            color,
            updatedAt: Date.now(),
          });
          return { otherUsersColors: newColors };
        });
      },

      removeUser: (nickname: string) => {
        set((state) => {
          const newColors = new Map(state.otherUsersColors);
          newColors.delete(nickname);
          return { otherUsersColors: newColors };
        });
      },

      clearAllOtherUsers: () => {
        set({ otherUsersColors: new Map() });
      },

      // Universal getters
      getEffectiveColor: (nickname: string, isCurrentUser = false) => {
        const state = get();

        if (isCurrentUser) {
          // For current user, use their saved color preference
          if (state.myColor) {
            return state.myColor;
          }
          return generateNicknameColor(nickname);
        }

        // For other users, check if we have their color from socket
        const userColor = state.otherUsersColors.get(nickname);
        if (userColor?.color) {
          return userColor.color;
        }
        return generateNicknameColor(nickname);
      },

      getUserColor: (nickname: string) => {
        const userColor = get().otherUsersColors.get(nickname);
        return userColor?.color ?? null;
      },
    }),
    {
      name: 'user-colors',
      // Only persist current user's color, not other users' colors
      partialize: (state) => ({
        myColor: state.myColor,
        // Don't persist otherUsersColors - they come from socket
      }),
    },
  ),
);
