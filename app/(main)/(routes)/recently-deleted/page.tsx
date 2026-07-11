"use client";

import { useEffect, useState } from "react";
import { getDeletedItems, restoreItem, permanentlyDeleteItem } from "@/actions/items";
import { Item } from "@/db/schema";
import { Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SkeletonReveal } from "@/components/ui/skeleton-reveal";

const DeletedItemsSkeleton = () => (
  <div className="flex flex-col w-full opacity-60">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-start gap-x-3 py-3 px-8 border-b-[0.5px] border-secondary/50 dark:border-secondary/30">
        <div className="flex items-center justify-center h-[22px] shrink-0">
          <Trash2 className="h-5 w-5 text-[#a1a1a1] dark:text-[#646464] opacity-50" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2 pt-1">
          <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-3 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

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
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-x-3 px-8 pt-8 pb-4 shrink-0">
        <h1 className="text-4xl font-bold text-neutral-500">
          Recently Deleted
        </h1>
        <div className="ml-auto text-4xl font-light opacity-50 tabular-nums">
          {items.length}
        </div>
      </div>

      <SkeletonReveal 
        isLoading={isLoading} 
        skeleton={<DeletedItemsSkeleton />}
        className="flex-1 min-h-0 flex flex-col"
      >
        <div className="flex-1 overflow-y-auto space-y-1 pb-20">
          {items.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center pt-20">
              No recently deleted reminders.
            </p>
          )}
          {items.map((item) => (
            <div 
              key={item.id}
              className={cn(
                "group flex items-start gap-x-3 py-3 border-b-[0.5px] border-solid border-secondary/50 dark:border-secondary/30 last:border-0 relative outline-none",
                "transition-colors duration-200 ease-in-out px-8",
                "focus:bg-zinc-100 dark:focus:bg-zinc-800/50 focus:rounded-none focus:border-transparent"
              )}
            >
              <div className="flex items-center justify-center h-[22px] shrink-0">
                <Trash2 className="h-4 w-4 text-[#a1a1a1] dark:text-[#646464]" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-sm font-medium tracking-[0.005em] leading-[22px] h-[22px] text-[#1d1d1d] dark:text-zinc-100 dark:antialiased truncate p-0 m-0 self-start max-w-full">
                  {item.text}
                </p>
                <p className="text-xs tracking-[0.005em] leading-normal text-[#646464] dark:text-zinc-400 whitespace-pre-wrap break-words mt-0.5 p-0 m-0 self-start max-w-full">
                  Deleted on {item.updatedAt ? new Date(item.updatedAt + "Z").toLocaleDateString(undefined, { dateStyle: 'medium' }) : "unknown date"}
                </p>
              </div>
              <div className="flex items-center gap-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition shrink-0 h-[22px]">
                <button
                  onClick={() => handleRestore(item.id)}
                  className="flex items-center justify-center rounded-full bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 dark:bg-zinc-800 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-[#a1a1a1] dark:text-[#646464] h-6 w-6 transition"
                  title="Restore"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handlePermanentDelete(item.id)}
                  className="flex items-center justify-center rounded-full bg-zinc-100 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-[#a1a1a1] dark:text-[#646464] h-6 w-6 transition"
                  title="Delete Permanently"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </SkeletonReveal>
    </div>
  );
}

export default RecentlyDeletedPage;
