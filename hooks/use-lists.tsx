import { create } from "zustand";
import { List } from "@/db/schema";
import { getLists } from "@/actions/lists";

interface ListsStore {
  lists: List[];
  isLoading: boolean;
  fetchLists: () => Promise<void>;
  updateLocalList: (id: string, values: Partial<List>) => void;
  addLocalList: (list: List) => void;
  removeLocalList: (id: string) => void;
}

export const useLists = create<ListsStore>((set) => ({
  lists: [],
  isLoading: false,
  fetchLists: async () => {
    set({ isLoading: true });
    try {
      const data = await getLists();
      set({ lists: data });
    } finally {
      set({ isLoading: false });
    }
  },
  updateLocalList: (id, values) => {
    set((state) => ({
      lists: state.lists.map((list) => 
        list.id === id ? { ...list, ...values } : list
      )
    }));
  },
  addLocalList: (list) => {
    set((state) => ({
      lists: [list, ...state.lists]
    }));
  },
  removeLocalList: (id) => {
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id)
    }));
  }
}));
