import type {
  SortField,
  SortOrder,
} from '@/features/collection/utils/album-helpers';
import type { Album, Collection } from '@radio/types';
import { create } from 'zustand';

export type CollectionTab = 'albums' | 'playlists';

type CollectionState = {
  activeTab: CollectionTab;
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  selectedAlbum: Album | null;
  selectedPlaylist: Collection | null;
};

type CollectionActions = {
  setActiveTab: (tab: CollectionTab) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortField) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setSelectedAlbum: (album: Album | null) => void;
  setSelectedPlaylist: (playlist: Collection | null) => void;
};

const initialState: CollectionState = {
  activeTab: 'albums',
  searchQuery: '',
  sortBy: 'dateAdded',
  sortOrder: 'desc',
  selectedAlbum: null,
  selectedPlaylist: null,
};

/** What the collection page remembers between visits: the tab, the search
    and sort, and what is open on the slab. */
export const useCollectionStore = create<CollectionState & CollectionActions>(
  (set) => ({
    ...initialState,
    // Switching the tab starts the other list fresh.
    setActiveTab: (tab) =>
      set({
        ...initialState,
        activeTab: tab,
      }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSortOrder: (sortOrder) => set({ sortOrder }),
    setSelectedAlbum: (selectedAlbum) => set({ selectedAlbum }),
    setSelectedPlaylist: (selectedPlaylist) => set({ selectedPlaylist }),
  }),
);
