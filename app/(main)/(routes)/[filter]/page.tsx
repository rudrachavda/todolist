"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTodayItems, getScheduledItems, getAllItems, getCompletedItems, createItem, updateItem } from "@/actions/items";
import { Item } from "@/db/schema";
import { Plus, Circle, CheckCircle2, Calendar, Clock, Inbox, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const FilterPage = () => {
  const params = useParams();
  const filter = params.filter as string;
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");

  const filterConfig: Record<string, { label: string, icon: any, color: string, fetcher: any }> = {
    today: { label: "Today", icon: Calendar, color: "#3b82f6", fetcher: getTodayItems },
    scheduled: { label: "Scheduled", icon: Clock, color: "#ef4444", fetcher: getScheduledItems },
    all: { label: "All", icon: Inbox, color: "#737373", fetcher: getAllItems },
    completed: { label: "Completed", icon: CheckCircle, color: "#a3a3a3", fetcher: getCompletedItems },
  };

  const config = filterConfig[filter];

  useEffect(() => {
    const fetchData = async () => {
      if (config) {
        const data = await config.fetcher();
        setItems(data);
      }
    };
    fetchData();
  }, [filter, config]);

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

  if (!config) return <div>Invalid Filter</div>;

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
