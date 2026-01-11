import { create } from 'zustand';

interface SearchState {
    query: string;
    suggestions: string[];
    isSearching: boolean;
    setQuery: (query: string) => void;
    setSuggestions: (suggestions: string[]) => void;
    setSearching: (searching: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
    query: '',
    suggestions: [],
    isSearching: false,
    setQuery: (query) => set({ query }),
    setSuggestions: (suggestions) => set({ suggestions }),
    setSearching: (searching) => set({ isSearching: searching }),
}));
