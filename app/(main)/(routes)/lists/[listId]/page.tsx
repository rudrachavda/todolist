"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getListById, updateList } from "@/actions/lists";
import { getItemsByList, createItem, updateItem, deleteItem, moveItem } from "@/actions/items";
import { useLists } from "@/hooks/use-lists";
import { List, Item as ItemSchema } from "@/db/schema";
import { Plus, Circle, CheckCircle2, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableItem } from "@/app/(main)/_components/draggable-item";

const ListIdPage = () => {
  const params = useParams();
  const listId = params.listId as string;
  const [items, setItems] = useState<ItemSchema[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [activeItem, setActiveItem] = useState<ItemSchema | null>(null);

  const { lists, updateLocalList, fetchItemCounts } = useLists(); 
  
  const list = lists.find(l => l.id === listId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchData = async () => {
      const itemsData = await getItemsByList(listId);
      setItems(itemsData);
      if (list) {
        setTitleValue(list.name);
      }
    };
    fetchData();
  }, [listId, list]);

  const onRename = async () => {
    if (!titleValue.trim() || titleValue === list?.name) {
      setIsEditingTitle(false);
      setTitleValue(list?.name || "");
      return;
    }

    updateLocalList(listId, { name: titleValue });
    await updateList(listId, { name: titleValue });
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
    setShowInput(false);
    fetchItemCounts(); 
  };

  const handleToggleCompletion = async (item: ItemSchema) => {
    const updatedStatus = !item.isCompleted;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, isCompleted: updatedStatus } : i));
    await updateItem(item.id, { isCompleted: updatedStatus });
    fetchItemCounts(); 
  };

  const handleDeleteItem = async (id: string) => {
    const promise = deleteItem(id)
      .then(() => {
        setItems(prev => prev.filter(i => i.id !== id));
        fetchItemCounts(); 
      });
    
    toast.promise(promise, {
      loading: "Deleting reminder...",
      success: "Reminder moved to Trash",
      error: "Failed to delete reminder"
    });
  };

  const handleUpdateItem = async (id: string, updates: Partial<ItemSchema>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    await updateItem(id, updates);
    fetchItemCounts();
  };

  const handleDragStart = (event: any) => {
    setActiveItem(event.active.data.current?.item);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveItem(null); 

    if (!over) return;

    const activeItemData = active.data.current?.item;
    const oldListId = activeItemData?.listId;

    const overType = over.data.current?.type;
    let targetListId: string | undefined;

    if (overType === 'List') { 
      targetListId = over.data.current?.listId;
    } else if (overType === 'ListGroup' && over.data.current?.listId) { 
      targetListId = over.data.current.listId;
    }

    if (activeItemData && targetListId && targetListId !== oldListId) {
      const promise = moveItem(activeItemData.id, targetListId, oldListId)
        .then(() => {
          setItems(prev => prev.filter(item => item.id !== activeItemData.id)); 
          fetchItemCounts(); 
        });

      toast.promise(promise, {
        loading: "Moving reminder...",
        success: "Reminder moved!",
        error: "Failed to move reminder."
      });
    }
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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="flex-1 overflow-y-auto space-y-1"
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInput(true);
            }
          }}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <DraggableItem 
                key={item.id}
                item={item}
                onToggleCompletion={handleToggleCompletion}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeItem ? (
            <DraggableItem 
              item={activeItem}
              onToggleCompletion={handleToggleCompletion}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {showInput && (
        <form 
          onSubmit={handleCreateItem}
          className="flex items-center gap-x-3 py-3"
        >
          <Plus className="h-6 w-6 text-muted-foreground" />
          <input 
              autoFocus
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onBlur={() => {
                if (!newItemText.trim()) setShowInput(false);
              }}
              placeholder="Add a reminder..."
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/50"
          />
        </form>
      )}
    </div>
  );
}

export default ListIdPage;