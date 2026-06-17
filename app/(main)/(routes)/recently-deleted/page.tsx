"use client";

import { useEffect, useState } from "react";
import { getDeletedItems, restoreItem, permanentlyDeleteItem } from "@/actions/items";
import { Item } from "@/db/schema";
import { Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const RecentlyDeletedPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    const data = await getDeletedItems();
    setItems(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (id: string) => {
    const promise = restoreItem(id)
      .then(() => {
        setItems(prev => prev.filter(item => item.id !== id));
      });

    toast.promise(promise, {
      loading: "Restoring reminder...",
      success: "Reminder restored!",
      error: "Failed to restore reminder."
    });
  };

  const handlePermanentDelete = async (id: string) => {
    const promise = permanentlyDeleteItem(id)
      .then(() => {
        setItems(prev => prev.filter(item => item.id !== id));
      });

    toast.promise(promise, {
      loading: "Deleting permanently...",
      success: "Reminder deleted forever",
      error: "Failed to delete reminder"
    });
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      <div className="flex items-center gap-x-3">
        <h1 className="text-4xl font-bold text-neutral-500">
          Recently Deleted
        </h1>
        <div className="ml-auto text-4xl font-light opacity-50">
          {items.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {items.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center pt-20">
            No recently deleted reminders.
          </p>
        )}
        {items.map((item) => (
          <div 
            key={item.id}
            className="group flex items-start gap-x-3 py-3 border-b border-secondary/50 last:border-0"
          >
            <div className="mt-0.5">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-lg font-medium text-muted-foreground line-through">
                {item.text}
              </p>
              <p className="text-xs text-muted-foreground">
                Deleted on {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "unknown date"}
              </p>
            </div>
            <div className="flex items-center gap-x-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => handleRestore(item.id)}
                className="p-2 hover:bg-secondary rounded-full"
                title="Restore"
              >
                <Undo2 className="h-5 w-5 text-blue-500" />
              </button>
              <button
                onClick={() => handlePermanentDelete(item.id)}
                className="p-2 hover:bg-red-500/10 rounded-full"
                title="Delete Permanently"
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentlyDeletedPage;
