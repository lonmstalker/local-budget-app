import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  selectedDate: Date;
  selectedAccount: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  viewMode: "list" | "grid";

  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedAccount: (account: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "list" | "grid") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      selectedDate: new Date(),
      selectedAccount: null,
      selectedCategory: null,
      searchQuery: "",
      viewMode: "list",

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setSelectedAccount: (selectedAccount) => set({ selectedAccount }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
      }),
    },
  ),
);
