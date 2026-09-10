# Code Style Guide

> Reference document for all Radio monorepo projects. Based on the admin app codebase.

---

## Table of Contents

1. [File Naming](#file-naming)
2. [Component Structure](#component-structure)
3. [Imports & Exports](#imports--exports)
4. [Hooks](#hooks)
5. [State Management](#state-management)
6. [API Patterns](#api-patterns)
7. [Styling](#styling)
8. [TypeScript](#typescript)
9. [Testing](#testing)
10. [Documentation](#documentation)

---

## File Naming

### General Rules

| Type | Convention | Example |
|------|-----------|---------|
| Components | `kebab-case.tsx` | `album-list.tsx`, `user-menu.tsx` |
| Hooks | `use-name.ts` | `use-album-api.ts`, `use-stream.ts` |
| Stores | `name-store.ts` | `auth-store.ts`, `collection-store.ts` |
| Services | `name-api.ts` or `name-service.ts` | `album-api.ts`, `websocket-service.ts` |
| Types | Inline or `types.ts` in feature folder | `types.ts` |
| Utils | `name-helpers.ts` or `name-utils.ts` | `album-helpers.ts` |
| Pages | `name-page.tsx` | `collection-page.tsx`, `main-page.tsx` |
| Layouts | `name-layout.tsx` | `admin-layout.tsx`, `radio-layout.tsx` |

### Examples

```
features/
├── collection/
│   ├── components/
│   │   ├── album-list.tsx        # Component
│   │   ├── album-detail.tsx      # Component
│   │   └── index.ts              # Barrel export
│   ├── hooks/
│   │   ├── use-collection-data.ts # Hook
│   │   └── index.ts              # Barrel export
│   ├── store/
│   │   ├── collection-store.ts   # Zustand store
│   │   └── index.ts              # Barrel export
│   ├── utils/
│   │   ├── album-helpers.ts      # Utilities
│   │   └── index.ts              # Barrel export
│   ├── collection-page.tsx       # Page component
│   └── index.ts                  # Feature barrel
```

---

## Component Structure

### Functional Components

**Use named exports with arrow functions:**

```tsx
// ✅ Preferred
export const AlbumList = () => {
  const { albums, isLoading } = useCollectionData();
  
  return (
    <div className={clsx(styles.container)}>
      {/* ... */}
    </div>
  );
};

// ❌ Avoid
export function AlbumList() {
  // ...
}

// ❌ Avoid React.FC
export const AlbumList: React.FC<Props> = () => {
  // ...
};
```

### Props Definition

**Use TypeScript interfaces:**

```tsx
// ✅ Preferred - Interface defined above
interface AlbumListProps {
  albums: Album[];
  isLoading?: boolean;
  onSelect?: (id: number) => void;
}

export const AlbumList = ({ 
  albums, 
  isLoading = false, 
  onSelect 
}: AlbumListProps) => {
  // ...
};

// ✅ For simple props - inline
export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  // ...
};
```

### forwardRef Components

**Use forwardRef with displayName:**

```tsx
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={clsx(styles.wrapper)}>
        {label && <label>{label}</label>}
        <input ref={ref} className={clsx(styles.input, className)} {...props} />
        {error && <span className={clsx(styles.error)}>{error}</span>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
```

### Styles Object Pattern

**Use `const styles` object with Tailwind classes:**

```tsx
export const Component = () => {
  return (
    <div className={clsx(styles.container)}>
      <h1 className={clsx(styles.title)}>Title</h1>
    </div>
  );
};

const styles = {
  container: [
    'w-full h-screen',
    'flex flex-col',
    'bg-coal text-paper-fog',
  ],
  title: [
    'text-2xl font-bold',
    'text-sun',
  ],
} as const;
```

**Guidelines:**
- Group related classes logically (layout, then styling, then states)
- Use `as const` for better type inference
- Use `clsx()` for conditional classes

---

## Imports & Exports

### Import Order

Imports are auto-organized by Biome. Manual ordering:
1. React and React ecosystem
2. Third-party libraries
3. Internal aliases (`@/`)
4. Workspace packages (`@radio/`)
5. Types (with `import type`)

```tsx
// React
import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from '@tanstack/react-router';

// Third-party
import clsx from 'clsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { create } from 'zustand';

// Internal
import { useAuthStore } from '@/stores/auth-store';
import { albumApi } from '@/services/api/album-api';

// Workspace
import type { Album } from '@radio/types';

// Types
import type { ReactNode } from 'react';
```

### Barrel Exports

**Use re-export patterns:**

```tsx
// ✅ Preferred - index.ts
export * from './album-list';
export * from './album-detail';
export * from './album-card';

// ✅ For named exports
export { AlbumList } from './album-list';
export { AlbumDetail } from './album-detail';

// ✅ Type exports
export type { AlbumFilters, SortField } from './types';
```

### Deep Re-exports

```tsx
// features/collection/components/index.ts
export * from './content';
export * from './modals';
export * from './sidebar';
export * from './shared';

// features/collection/components/content/index.ts
export * from './albums';
export * from './playlists';
```

---

## Hooks

### Naming Convention

- Start with `use`
- Use kebab-case in file names: `use-album-api.ts`
- Use camelCase in hook name: `useAlbumApi`

### Hook Structure

```tsx
// Query hook with TanStack Query
export const useAlbum = (id: number) => {
  return useQuery({
    queryKey: albumKeys.detail(id),
    queryFn: () => albumApi.getAlbumById(id),
    enabled: !!id,
  });
};

// Mutation hook with cache invalidation
export const useCreateAlbum = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: albumApi.createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: albumKeys.all });
    },
  });
};

// Composite hook combining queries
export const useCollectionData = () => {
  const { data: albums, isLoading: albumsLoading } = useUserAlbums();
  const { data: collections, isLoading: collectionsLoading } = useUserCollections();
  
  return {
    albums,
    collections,
    isLoading: albumsLoading || collectionsLoading,
  };
};
```

### Query Key Factories

**Create dedicated query key factories:**

```tsx
// services/api/keys/album-keys.ts
export const albumKeys = {
  all: ['albums'] as const,
  lists: () => [...albumKeys.all, 'list'] as const,
  list: (filters: string) => [...albumKeys.lists(), { filters }] as const,
  details: () => [...albumKeys.all, 'detail'] as const,
  detail: (id: number) => [...albumKeys.details(), id] as const,
  userAlbums: () => [...albumKeys.all, 'user'] as const,
  publicAlbums: () => [...albumKeys.all, 'public'] as const,
} as const;

// services/api/keys/index.ts
export * from './album-keys';
export * from './collection-keys';
export * from './user-keys';
```

### Custom Hooks (Non-Query)

```tsx
export const useNowPlaying = () => {
  const { currentTrack, isPlaying } = useNowPlayingStore();
  
  return {
    currentTrack,
    isPlaying,
  };
};
```

---

## State Management

### Zustand Store Pattern

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define state type
type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Define actions type
type AuthActions = {
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
};

// Create store
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token, user) => {
        localStorage.setItem('wave_auth_token', token);
        set({ token, user, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        localStorage.removeItem('wave_auth_token');
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

### Store Guidelines

1. **Separate state and actions types** - Makes the API clearer
2. **Use `type` over `interface`** - Prefer type aliases
3. **Persist with partialize** - Only persist what's needed
4. **Keep actions simple** - Complex logic belongs in services/hooks
5. **Use localStorage directly in actions** - For token storage

---

## API Patterns

### HTTP Client Factory

```tsx
// services/api/clients/http-client.ts
import axios, { type AxiosInstance } from 'axios';
import { apiUrl } from '@/services/env';

const createHttpClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor for auth
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('wave_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('wave_auth_token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export const waveApiClient = createHttpClient(apiUrl);
```

### API Layer

```tsx
// services/api/album-api.ts
import { waveApiClient } from './clients/http-client';
import type { Album, AlbumWithSongs } from '@radio/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type CreateAlbumData = {
  title: string;
  artist: string;
  year?: number;
};

export const albumApi = {
  getPublicAlbums: async (
    filters?: AlbumFilters,
    limit?: number,
    offset?: number,
  ): Promise<Album[]> => {
    const response = await waveApiClient.get<ApiResponse<Album[]>>('/albums/public', {
      params: { ...filters, limit, offset },
    });
    return response.data.data;
  },

  getAlbumById: async (id: number): Promise<AlbumWithSongs> => {
    const response = await waveApiClient.get<ApiResponse<AlbumWithSongs>>(`/albums/${id}`);
    return response.data.data;
  },

  createAlbum: async (data: CreateAlbumData): Promise<{ id: number }> => {
    const response = await waveApiClient.post<ApiResponse<{ id: number }>>('/albums', data);
    return response.data.data;
  },

  uploadCoverArt: async (id: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('cover', file);
    await waveApiClient.post(`/albums/${id}/cover`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCoverArtUrl: (id: number): string => {
    return `${apiUrl}/api/albums/${id}/cover`;
  },
};
```

### Environment Variables

```tsx
// services/env.ts
import pkg from '../../package.json';

export const version = pkg.version;

export const getEnv = () => import.meta.env.VITE_APP_ENV;

function getDefaultApiUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:6870`;
  }
  return 'http://localhost:6870';
}

function getDefaultSocketUrl(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${hostname}:6871`;
  }
  return 'ws://localhost:6871';
}

export const apiUrl = import.meta.env.VITE_API_URL || getDefaultApiUrl();
export const socketUrl = import.meta.env.VITE_SOCKET_URL || getDefaultSocketUrl();

export const isDev = getEnv() === 'development';
export const isProd = getEnv() === 'production';
export const isPreview = getEnv() === 'preview';
```

---

## Styling

### Tailwind Classes

**Use the `styles` object pattern:**

```tsx
export const Card = ({ children }) => {
  return (
    <div className={clsx(styles.container)}>
      <div className={clsx(styles.header)}>
        <h2 className={clsx(styles.title)}>Title</h2>
      </div>
      <div className={clsx(styles.content)}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  container: [
    'rounded-lg',
    'bg-white dark:bg-gray-800',
    'shadow-lg',
    'border border-gray-200',
  ],
  header: [
    'px-4 py-3',
    'border-b border-gray-200',
  ],
  title: [
    'text-lg font-semibold',
    'text-gray-900',
  ],
  content: [
    'p-4',
  ],
} as const;
```

### Conditional Classes

```tsx
// With clsx
<div className={clsx(
  styles.button,
  isActive && styles.active,
  isDisabled && styles.disabled,
)}>

// Multiple conditions
<button className={clsx(
  styles.base,
  variant === 'primary' && styles.primary,
  variant === 'secondary' && styles.secondary,
  size === 'sm' && styles.small,
  size === 'lg' && styles.large,
)}>
```

---

## TypeScript

### Configuration

**Minimum tsconfig.json settings:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@radio/types": ["../../packages/types/src"]
    }
  }
}
```

### Type Definitions

```tsx
// Prefer type over interface for state
type AlbumState = {
  albums: Album[];
  isLoading: boolean;
  error: string | null;
};

// Use interface for object shapes that might be extended
interface AlbumFilters {
  yearMin?: number;
  yearMax?: number;
  genres?: string[];
}

// Use type for unions and intersections
type Status = 'idle' | 'loading' | 'success' | 'error';
type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

// Export type separately
export type { AlbumFilters, Status };
```

### Type Exports

```tsx
// Inline export
export type SortField = 'dateAdded' | 'title' | 'artist' | 'year';

// Named export at end
type AlbumWithSongs = Album & { songs: Song[] };
export type { AlbumWithSongs };
```

---

## Testing

### Test File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Unit tests | `name.test.ts` | `album-helpers.test.ts` |
| Component tests | `Component.test.tsx` | `AlbumList.test.tsx` |
| Integration | `name.integration.test.ts` | `api.integration.test.ts` |

### Test Structure

```tsx
// album-helpers.test.ts
import { describe, it, expect } from 'vitest';
import { filterAlbums, sortAlbums } from './album-helpers';

describe('filterAlbums', () => {
  it('should filter by year range', () => {
    const albums = [
      { id: 1, year: 1970 },
      { id: 2, year: 1980 },
    ];
    
    const result = filterAlbums(albums, { yearMin: 1975 });
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});
```

---

## Documentation

### Code Comments

```tsx
// ✅ Good - Explain "why"
// Using partialize to only persist essential auth state
// (avoid persisting loading states)
partialize: (state) => ({
  user: state.user,
  token: state.token,
}),

// ✅ Good - Document complex logic
// Calculate consistent nickname color using a simple hash
// This ensures the same nickname always gets the same color
let hash = 0;
for (let i = 0; i < nickname.length; i++) {
  const char = nickname.charCodeAt(i);
  hash = (hash << 5) - hash + char;
  hash = hash & hash; // Convert to 32-bit integer
}

// ❌ Avoid - Obvious comments
// Increment counter
counter++;
```

### JSDoc for Public APIs

```tsx
/**
 * Generates a consistent color class for a given nickname.
 * Uses a hash function to ensure the same nickname always
 * gets the same color.
 * 
 * @param nickname - The nickname to generate a color for
 * @returns A Tailwind text color class (e.g., 'text-moss')
 */
export const generateNicknameColor = (nickname: string): string => {
  // ...
};
```

---

## Folder Structure

### Feature-Based Organization

```
src/
├── features/
│   ├── collection/
│   │   ├── components/
│   │   │   ├── content/
│   │   │   ├── modals/
│   │   │   ├── sidebar/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-collection-data.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── collection-store.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── album-helpers.ts
│   │   │   └── index.ts
│   │   ├── collection-page.tsx
│   │   └── index.ts
│   └── index.ts
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── index.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── clients/
│   │   ├── hooks/
│   │   ├── keys/
│   │   ├── album-api.ts
│   │   └── index.ts
│   ├── env.ts
│   └── websocket-service.ts
├── stores/
│   ├── auth-store.ts
│   └── index.ts
├── hooks/
│   └── index.ts
├── styles/
│   └── globals.css
├── main.tsx
├── router.tsx
└── vite-env.d.ts
```

---

## Quick Reference

### Do's

- ✅ Use `kebab-case.ts` for all file names
- ✅ Use `use-name.ts` for hook files
- ✅ Use `name-store.ts` for store files
- ✅ Use named exports (`export const X = ()`)
- ✅ Use `clsx()` for conditional classes
- ✅ Use `type` for state and action types
- ✅ Use TanStack Query for data fetching
- ✅ Use query key factories
- ✅ Use factory pattern for API clients
- ✅ Use barrel exports (`export * from './x'`)
- ✅ Add `displayName` to `forwardRef` components

### Don'ts

- ❌ Use `React.FC` type annotation
- ❌ Use `interface` for store state
- ❌ Create hooks without `use` prefix
- ❌ Mix naming conventions in same project
- ❌ Fetch data with `useEffect` (use TanStack Query)
- ❌ Hardcode API URLs (use env.ts)
- ❌ Export default from modules
- ❌ Skip TypeScript strict checks

---

*Document Version: 1.0*
*Last Updated: 2026-04-06*
*Based on: apps/admin codebase*