"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getTodayItems, getScheduledItems, getAllItems, getCompletedItems, createItem, updateItem, deleteItem, moveItem } from "@/actions/items";
import { Item, List } from "@/db/schema";
import { Plus, Circle, CheckCircle2, Calendar, Clock, Inbox, CheckCircle, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLists } from "@/hooks/use-lists";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  UniqueIdentifier,
  useDroppable,
  DragOverlay
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ExtendedItem extends Item {
  listName?: string;
  listColor?: string;
}

interface GroupedItems {
  list: { name: string; color: string; id: string } | null;
  items: ExtendedItem[];
}

interface DraggableItemProps {
  item: ExtendedItem;
  onToggleCompletion: (item: ExtendedItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<ExtendedItem>) => void;
  wrapperRef?: React.Ref<HTMLDivElement>;
}

const DraggableItem = ({ item, onToggleCompletion, onDeleteItem, onUpdateItem, wrapperRef }: DraggableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: item.id, data: { item }});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div 
      ref={wrapperRef ? wrapperRef : setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="group flex items-start gap-x-3 py-3 border-b border-secondary/50 last:border-0 relative"
    >
      <button
        onClick={() => onToggleCompletion(item)}
        className="mt-0.5 hover:opacity-75 transition"
      >
        {item.isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
      </button>
      <div className="flex-1 space-y-0.5">
        <p className={cn(
          "text-lg font-medium transition",
          item.isCompleted && "text-neutral-500 dark:text-[#646464]"
        )}>
          {item.text}
        </p>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}
        {item.dueDate && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-x-1">
            <CalendarIcon className="h-3 w-3" />
            {new Date(item.dueDate).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-x-2 opacity-0 group-hover:opacity-100 transition">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 hover:bg-neutral-500/10 rounded-md" title="Set Due Date">
              <CalendarIcon className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="border rounded p-1.5 text-sm bg-background text-foreground"
                  value={item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateItem(item.id, { dueDate: val ? new Date(val).toISOString() : null });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Notes</label>
                <textarea 
                  placeholder="Add notes..."
                  className="border rounded p-1.5 text-sm bg-background text-foreground resize-none h-20"
                  value={item.description || ''}
                  onChange={(e) => {
                    onUpdateItem(item.id, { description: e.target.value || null });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <button
          onClick={() => onDeleteItem(item.id)}
          className="p-1.5 hover:bg-red-500/10 rounded-md"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface DroppableListGroupProps {
  list: { name: string; color: string; id: string } | null;
  children: React.ReactNode;
}

const DroppableListGroup = ({ list, children }: DroppableListGroupProps) => {
  const {setNodeRef, isOver} = useDroppable({
    id: list?.id || 'no-list-items',
    data: {
      type: 'ListGroup',
      listId: list?.id,
    },
  });

  return (
    <div 
      ref={setNodeRef} 
      className={cn("mb-4", isOver && "ring-2 ring-blue-500 ring-offset-2")}
    >
      {list && (
        <h2 className="text-2xl font-bold mb-2" style={{ color: list.color }}>
          {list.name}
        </h2>
      )}
      {children}
    </div>
  );
};


const filterConfig: Record<string, { label: string, icon: any, color: string, fetcher: any }> = {
  today: { label: "Today", icon: Calendar, color: "#3b82f6", fetcher: getTodayItems },
  scheduled: { label: "Scheduled", icon: Clock, color: "#ef4444", fetcher: getScheduledItems },
  all: { label: "All", icon: Inbox, color: "#737373", fetcher: getAllItems },
  completed: { label: "Completed", icon: CheckCircle, color: "#a3a3a3", fetcher: getCompletedItems },
};

const FilterPage = () => {
  const params = useParams();
  const filter = params.filter as string;
  const [items, setItems] = useState<ExtendedItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<ExtendedItem | null>(null);

  const config = filterConfig[filter];
  const { lists: allLists, fetchItemCounts } = useLists(); // Destructure fetchItemCounts

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
      if (config) {
        setIsLoading(true);
        const data = await config.fetcher();
        setItems(filter === "all" ? data.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : data);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [filter, config]);

  const groupedItems = useMemo(() => {
    if (filter !== "all") {
      return [{ list: null, items }];
    }

    const groups: { [listId: string]: GroupedItems } = {};
    
    // Initialize groups with all lists, even if empty
    allLists.forEach(list => {
      groups[list.id] = {
        list: { id: list.id, name: list.name, color: list.color },
        items: []
      };
    });

    items.forEach(item => {
      const listId = item.listId || "no-list";
      if (!groups[listId]) {
        // This case should ideally not happen if all items have a valid listId
        // but acts as a fallback for items without a proper parent
        groups[listId] = {
          list: { id: listId, name: item.listName || "Untitled List", color: item.listColor || "#000000" },
          items: []
        };
      }
      groups[listId].items.push(item);
    });

    const result = Object.values(groups).sort((a, b) => {
      if (!a.list && b.list) return -1;
      if (a.list && !b.list) return 1;
      if (!a.list && !b.list) return 0;
      return a.list!.name.localeCompare(b.list!.name);
    });

    return result;
  }, [items, filter, allLists]); // Add allLists to dependency array

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const dueDate = filter === "today" ? new Date().toISOString().split('T')[0] : undefined;
    const newItem = await createItem(newItemText, undefined, dueDate);
    
    // Re-fetch all items for the current filter to reflect the new item
    // This is especially important for filters like "Today", "Scheduled", "All"
    // where item placement depends on their properties
    const updatedItems = await config.fetcher();
    setItems(filter === "all" ? updatedItems.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : updatedItems);

    setNewItemText("");
    setShowInput(false);
    fetchItemCounts(); // Update global counts
  };

  const handleToggleCompletion = async (item: ExtendedItem) => {
    const updatedStatus = !item.isCompleted;
    await updateItem(item.id, { isCompleted: updatedStatus });
    
    // Re-fetch all items for the current filter to reflect the completion status
    // This handles items disappearing from 'Today', 'All', or appearing in 'Completed'
    const updatedItems = await config.fetcher();
    setItems(filter === "all" ? updatedItems.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : updatedItems);

    fetchItemCounts(); // Update global counts
  };

  const handleDeleteItem = async (id: string) => {
    const promise = deleteItem(id)
      .then(async () => {
        // Re-fetch all items for the current filter to reflect the deletion
        const updatedItems = await config.fetcher();
        setItems(filter === "all" ? updatedItems.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : updatedItems);
        fetchItemCounts(); // Update global counts
      });
    
    toast.promise(promise, {
      loading: "Deleting reminder...",
      success: "Reminder moved to Trash",
      error: "Failed to delete reminder"
    });
  };

  const handleUpdateItem = async (id: string, updates: Partial<ExtendedItem>) => {
    // Optimistically update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    await updateItem(id, updates);
    // Re-fetch to ensure order and lists are correct
    const updatedItems = await config.fetcher();
    setItems(filter === "all" ? updatedItems.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : updatedItems);
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

    if (overType === 'List') { // Dropped on a sidebar list item
      targetListId = over.data.current?.listId;
    } else if (overType === 'ListGroup' && over.data.current?.listId) { // Dropped on a list group heading in FilterPage
      targetListId = over.data.current.listId;
    }

    if (activeItemData && targetListId && targetListId !== oldListId) {
      const promise = moveItem(activeItemData.id, targetListId, oldListId)
        .then(async () => {
          // Re-fetch all items for the current filter to reflect the move
          const updatedItems = await config.fetcher();
          setItems(filter === "all" ? updatedItems.map((d: any) => ({ ...d.item, listName: d.list?.name, listColor: d.list?.color })) : updatedItems);
          fetchItemCounts(); // Update global counts
        });

      toast.promise(promise, {
        loading: "Moving reminder...",
        success: "Reminder moved!",
        error: "Failed to move reminder."
      });
    }
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

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="flex-1 overflow-y-auto space-y-1"
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget && filter !== "completed" && filter !== "all") {
              setShowInput(true);
            }
          }}
        >
          {items.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center pt-20">
              No reminders found.
            </p>
          ) : isLoading ? (
              <div className="text-muted-foreground text-center pt-20">
                  Loading reminders...
              </div>
          ) : (
            groupedItems.map((group, groupIndex) => (
              <DroppableListGroup key={group.list?.id || `no-list-${groupIndex}`} list={group.list}>
                <SortableContext 
                  items={group.items.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {group.items.map((item) => (
                    <DraggableItem 
                      key={item.id}
                      item={item}
                      onToggleCompletion={handleToggleCompletion}
                      onDeleteItem={handleDeleteItem}
                      onUpdateItem={handleUpdateItem}
                    />
                  ))}
                </SortableContext>
              </DroppableListGroup>
            ))
          )}
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

      {filter !== "completed" && filter !== "all" && showInput && (
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

export default FilterPage;