import { create } from "zustand";
import { List } from "@/db/schema";
import { getLists } from "@/actions/lists";
import { getItemsCounts } from "@/actions/items";

interface ItemCounts {
  today: number;
  scheduled: number;
  all: number;
  completed: number;
  listCounts: Record<string, number>;
}

interface ListsStore {
  lists: List[];
  listLoading: boolean;
  itemCounts: ItemCounts;
  countsLoading: boolean;
  fetchLists: () => Promise<void>;
  fetchItemCounts: () => Promise<void>;
  updateLocalList: (id: string, values: Partial<List>) => void;
  addLocalList: (list: List) => void;
  removeLocalList: (id: string) => void;
}

export const useLists = create<ListsStore>((set) => ({
  lists: [],
  listLoading: false,
  itemCounts: { today: 0, scheduled: 0, all: 0, completed: 0, listCounts: {} },
  countsLoading: false,

  fetchLists: async () => {
    set({ listLoading: true });
    try {
      const data = await getLists();
      set({ lists: data });
    } finally {
      set({ listLoading: false });
    }
  },

  fetchItemCounts: async () => {
    set({ countsLoading: true });
    try {
      const data = await getItemsCounts();
      set({ itemCounts: data });
    } finally {
      set({ countsLoading: false });
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
