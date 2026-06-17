"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTodayItems, getScheduledItems, getAllItems, getCompletedItems, createItem, updateItem, deleteItem } from "@/actions/items";
import { Item } from "@/db/schema";
import { Plus, Circle, CheckCircle2, Calendar, Clock, Inbox, CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const filterConfig: Record<string, { label: string, icon: any, color: string, fetcher: any }> = {
  today: { label: "Today", icon: Calendar, color: "#3b82f6", fetcher: getTodayItems },
  scheduled: { label: "Scheduled", icon: Clock, color: "#ef4444", fetcher: getScheduledItems },
  all: { label: "All", icon: Inbox, color: "#737373", fetcher: getAllItems },
  completed: { label: "Completed", icon: CheckCircle, color: "#a3a3a3", fetcher: getCompletedItems },
};

const FilterPage = () => {
  const params = useParams();
  const filter = params.filter as string;
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const config = filterConfig[filter];

  useEffect(() => {
    const fetchData = async () => {
      if (config) {
        setIsLoading(true);
        const data = await config.fetcher();
        setItems(data);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filter, config]); // config is now stable because it's defined outside

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const dueDate = filter === "today" ? new Date().toISOString().split('T')[0] : undefined;
    const newItem = await createItem(newItemText, undefined, dueDate);
    setItems(prev => [newItem, ...prev]);
    setNewItemText("");
  };

  const handleToggleCompletion = async (item: Item) => {
    const updatedStatus = !item.isCompleted;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isCompleted: updatedStatus } : i));
    await updateItem(item.id, { isCompleted: updatedStatus });
  };

  const handleDeleteItem = async (id: string) => {
    const promise = deleteItem(id)
      .then(() => setItems(prev => prev.filter(i => i.id !== id)));
    
    toast.promise(promise, {
      loading: "Deleting reminder...",
      success: "Reminder moved to Trash",
      error: "Failed to delete reminder"
    });
  };

  if (!config) return <div className="p-8">Invalid Filter</div>;

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      <div className="flex items-center gap-x-3">
        <h1 
          className="text-4xl font-bold"
          style={{ color: config.color }}
        >
          {config.label}
        </h1>
        <div className="ml-auto text-4xl font-light opacity-50">
          {items.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {items.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center pt-20">
            No reminders found.
          </p>
        )}
        {items.map((item) => (
          <div 
            key={item.id}
            className="group flex items-start gap-x-3 py-3 border-b border-secondary/50 last:border-0"
          >
            <button
              onClick={() => handleToggleCompletion(item)}
              className="mt-0.5 hover:opacity-75 transition"
            >
              {item.isCompleted ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-500/10" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 space-y-0.5">
              <p className={cn(
                "text-lg font-medium transition",
                item.isCompleted && "text-muted-foreground line-through"
              )}>
                {item.text}
              </p>
              {item.dueDate && (
                <p className="text-xs text-red-500 font-medium">
                  {new Date(item.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/10 rounded-md"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </button>
          </div>
        ))}

        {filter !== "completed" && (
            <form 
            onSubmit={handleCreateItem}
            className="flex items-center gap-x-3 py-3"
            >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <input 
                autoFocus
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add a reminder..."
                className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50"
            />
            </form>
        )}
      </div>
    </div>
  );
}

export default FilterPage;
