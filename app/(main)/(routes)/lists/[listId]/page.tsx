"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getListById, updateList } from "@/actions/lists";
import { getItemsByList, createItem, updateItem, deleteItem, moveItem, reorderItems } from "@/actions/items";
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
  arrayMove
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

  const handleCreateItem = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const textToCreate = overrideText !== undefined ? overrideText : newItemText;
    if (!textToCreate.trim()) {
      setShowInput(false);
      return;
    }

    const newItem = await createItem(textToCreate, listId);
    setItems(prev => [...prev, newItem]);
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

    if (overType === 'Trash' && activeItemData) {
      handleDeleteItem(activeItemData.id);
      return;
    }

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
      return;
    }

    // Handle reordering within the same list
    if (active.id !== over.id) {
      const activeIndex = items.findIndex((i) => i.id === active.id);
      const overIndex = items.findIndex((i) => i.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(items, activeIndex, overIndex);
        setItems(newItems);

        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index * 1000
        }));

        await reorderItems(updates);
      }
    }
  };


  if (!list) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-x-3 group min-h-[48px] px-8 pt-8 pb-4 shrink-0">
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
          className="flex-1 overflow-y-auto space-y-1 pb-20"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInput(true);
            }
          }}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <DraggableItem 
                key={item.id}
                item={item}
                index={index}
                onToggleCompletion={handleToggleCompletion}
                onDeleteItem={handleDeleteItem}
                onUpdateItem={handleUpdateItem}
              />
            ))}
          </SortableContext>
          
          {showInput && (
            <form 
              onSubmit={handleCreateItem}
              className="flex items-center gap-x-3 py-3 px-8 shrink-0 border-b-[0.5px] border-solid border-secondary/50 dark:border-secondary/30 last:border-0"
            >
              <div className="shrink-0 opacity-50 flex items-center h-[22px]">
                <div className="h-5 w-5 rounded-full border border-solid border-[#a1a1a1] dark:border-[#646464]" />
              </div>
              <input 
                  autoFocus
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onBlur={() => {
                    if (!newItemText.trim()) {
                      handleCreateItem(undefined, "New Reminder");
                    } else {
                      handleCreateItem(undefined, newItemText);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowInput(false);
                      setNewItemText("");
                    }
                  }}
                  placeholder=""
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium tracking-[0.005em] leading-[22px] h-[22px] text-[#1d1d1d] dark:text-zinc-100 dark:antialiased placeholder:text-[#a1a1a1] dark:placeholder:text-[#646464]"
              />
            </form>
          )}
        </div>


      </DndContext>
    </div>
  );
}

export default ListIdPage;