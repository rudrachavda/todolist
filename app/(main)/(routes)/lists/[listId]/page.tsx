"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListById } from "@/actions/lists";
import { getItemsByList, createItem, updateItem } from "@/actions/items";
import { List, Item } from "@/db/schema";
import { Plus, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ListIdPage = () => {
  const params = useParams();
  const listId = params.listId as string;
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const listData = await getListById(listId);
      const itemsData = await getItemsByList(listId);
      setList(listData);
      setItems(itemsData);
    };
    fetchData();
  }, [listId]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = await createItem(newItemText, listId);
    setItems(prev => [newItem, ...prev]);
    setNewItemText("");
  };

  const handleToggleCompletion = async (item: Item) => {
    const updatedStatus = !item.isCompleted;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isCompleted: updatedStatus } : i));
    await updateItem(item.id, { isCompleted: updatedStatus });
  };

  if (!list) return null;

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      <div className="flex items-center gap-x-3">
        <h1 
          className="text-4xl font-bold"
          style={{ color: list.color }}
        >
          {list.name}
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
      </div>
    </div>
  );
}

export default ListIdPage;
