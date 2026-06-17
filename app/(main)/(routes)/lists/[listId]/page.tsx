"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getListById, updateList } from "@/actions/lists";
import { getItemsByList, createItem, updateItem, deleteItem } from "@/actions/items";
import { useLists } from "@/hooks/use-lists";
import { List, Item } from "@/db/schema";
import { Plus, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ListIdPage = () => {
  const params = useParams();
  const listId = params.listId as string;
  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const { updateLocalList } = useLists();

  useEffect(() => {
    const fetchData = async () => {
      const listData = await getListById(listId);
      const itemsData = await getItemsByList(listId);
      setList(listData);
      setTitleValue(listData?.name || "");
      setItems(itemsData);
    };
    fetchData();
  }, [listId]);

  const onRename = async () => {
    if (!titleValue.trim() || titleValue === list?.name) {
      setIsEditingTitle(false);
      setTitleValue(list?.name || "");
      return;
    }

    updateLocalList(listId, { name: titleValue });
    await updateList(listId, { name: titleValue });
    setList(prev => prev ? { ...prev, name: titleValue } : null);
    setIsEditingTitle(false);
  };

  const onTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onRename();
    }
    if (e.key === "Escape") {
      setIsEditingTitle(false);
      setTitleValue(list?.name || "");
    }
  };

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

  const handleDeleteItem = async (id: string) => {
    const promise = deleteItem(id)
      .then(() => setItems(prev => prev.filter(i => i.id !== id)));
    
    toast.promise(promise, {
      loading: "Deleting reminder...",
      success: "Reminder moved to Trash",
      error: "Failed to delete reminder"
    });
  };

  if (!list) return null;

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      <div className="flex items-center gap-x-3 group min-h-[48px]">
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={onRename}
            onKeyDown={onTitleKeyDown}
            className="text-4xl font-bold bg-transparent border-none outline-none p-0 w-full"
            style={{ color: list.color }}
          />
        ) : (
          <h1 
            onClick={() => setIsEditingTitle(true)}
            className="text-4xl font-bold cursor-text"
            style={{ color: list.color }}
          >
            {list.name}
          </h1>
        )}
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
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/10 rounded-md"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </button>
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
