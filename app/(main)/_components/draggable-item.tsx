"use client";

import { useState, useRef, useEffect } from "react";
import { Circle, CheckCircle2, Trash2, CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOnClickOutside } from "usehooks-ts";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CustomDatePicker } from "./custom-date-picker";

export interface SharedItemProps {
  id: string;
  text: string;
  description?: string | null;
  dueDate?: string | null;
  isCompleted: boolean;
  listName?: string;
  listColor?: string;
}

interface DraggableItemProps {
  item: SharedItemProps;
  onToggleCompletion: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: any) => void;
  wrapperRef?: React.Ref<HTMLDivElement>;
  isOverlay?: boolean;
  index?: number;
}

export const DraggableItem = ({ item, onToggleCompletion, onDeleteItem, onUpdateItem, wrapperRef, isOverlay, index }: DraggableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [description, setDescription] = useState(item.description || '');
  const getLocalISOString = (dateStr?: string | null) => {
    if (!dateStr) return '';
    if (dateStr.endsWith('Z')) {
      const d = new Date(dateStr);
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    }
    return dateStr.slice(0, 16);
  };

  const [dueDate, setDueDate] = useState(getLocalISOString(item.dueDate));

  // Sync state if item updates from parent
  useEffect(() => {
    setDueDate(getLocalISOString(item.dueDate));
  }, [item.dueDate]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  const ref = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
    over,
  } = useSortable({id: item.id, data: { item }});

  const setRefs = (node: HTMLDivElement) => {
    setNodeRef(node);
    if (ref) {
      (ref as any).current = node;
    }
    if (wrapperRef) {
      if (typeof wrapperRef === 'function') {
        wrapperRef(node);
      } else {
        (wrapperRef as any).current = node;
      }
    }
  };
  
  const style = {
    // We intentionally ignore `transform` here so items never physically shift during drag!
    // The visual movement is handled entirely by the DragOverlay, while the list remains static.
    transition,
    zIndex: isDragging ? 0 : 'auto',
  };

  const isOverItem = over?.id === item.id;
  const activeIndex = active?.data?.current?.sortable?.index;
  const overIndex = over?.data?.current?.sortable?.index;
  
  const dropIndicator = isOverItem && active?.id !== item.id
    ? activeIndex > overIndex ? "top" : "bottom"
    : null;

  const handleQuickDate = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'today':
        if (now.getHours() >= 17) {
          now.setHours(now.getHours() + 1, 0, 0, 0); // Next hour if past 5 PM
        } else {
          now.setHours(17, 0, 0, 0); // Today 5 PM
        }
        break;
      case 'tomorrow':
        now.setDate(now.getDate() + 1);
        now.setHours(9, 0, 0, 0);
        break;
      case 'weekend':
        const daysToSaturday = 6 - now.getDay();
        now.setDate(now.getDate() + (daysToSaturday === 0 ? 7 : daysToSaturday));
        now.setHours(9, 0, 0, 0);
        break;
      case 'next_week':
        const daysToMonday = 1 + (7 - now.getDay()) % 7;
        now.setDate(now.getDate() + (daysToMonday === 0 ? 7 : daysToMonday));
        now.setHours(9, 0, 0, 0);
        break;
    }
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
    setDueDate(localISOTime);
  };

  const handleSave = () => {
    setIsEditing(false);
    onUpdateItem(item.id, {
      text,
      description: description || null,
      dueDate: dueDate || null,
    });
  };

  useOnClickOutside(ref as any, (event) => {
    // If we're interacting with a portal element (like radix dropdowns), the event target
    // might be outside the ref but still logically part of our component's open state.
    if (isEditing && !isDropdownOpen) {
      handleSave();
    }
  });

  // Handle enter key in text input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div 
      ref={setRefs} 
      style={style} 
      {...attributes} 
      {...(isEditing ? {} : listeners)}
      onClick={(e) => {
        // Prevent click from propagating if we are already editing
        if (isEditing) e.stopPropagation();
      }}
      onDragStart={(e) => e.preventDefault()}
      className={cn(
        "group flex items-start gap-x-3 py-3 border-b-[0.5px] border-solid border-secondary/50 dark:border-secondary/30 last:border-0 relative outline-none",
        "transition-colors duration-200 ease-in-out px-8",
        "focus:bg-zinc-100 dark:focus:bg-zinc-800/50 focus:rounded-none focus:border-transparent",
        isDragging && !isOverlay && "bg-zinc-100 dark:bg-zinc-800/50 rounded-none opacity-60 border-transparent",
        isOverlay && "bg-white/70 dark:bg-[#1d1d1d]/70 backdrop-blur-md shadow-xl scale-[1.02] border-transparent"
      )}
    >
      {dropIndicator === 'top' && (
        <div className="absolute top-[-1px] left-0 right-0 h-[2px] bg-blue-500 rounded-full z-50 pointer-events-none" />
      )}
      {dropIndicator === 'bottom' && (
        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500 rounded-full z-50 pointer-events-none" />
      )}
      <div className="flex items-center justify-center h-[22px] shrink-0">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompletion(item);
          }}
          className="hover:opacity-75 transition"
        >
          {item.isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-zinc-900 fill-zinc-900 dark:text-zinc-100 dark:fill-zinc-100" />
          ) : (
            <Circle className="h-5 w-5 text-[#a1a1a1] dark:text-[#646464]" />
          )}
        </button>
      </div>
      
      {!isEditing ? (
        <>
          <div className="flex-1 min-w-0 flex flex-col">
          <p 
            className={cn(
              "text-sm font-medium tracking-[0.005em] leading-[22px] h-[22px] text-[#1d1d1d] dark:text-zinc-100 dark:antialiased transition-colors truncate p-0 m-0 cursor-text self-start max-w-full",
              item.isCompleted && "text-[#a1a1a1] dark:text-[#646464] line-through decoration-[#a1a1a1]/30 dark:decoration-[#646464]/30"
            )}
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {item.text}
          </p>
          {item.description && (
            <p 
              className="text-xs tracking-[0.005em] leading-none text-[#646464] dark:text-zinc-400 line-clamp-2 mt-0.5 p-0 m-0 cursor-text self-start max-w-full"
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {item.description}
            </p>
          )}
          {(item.dueDate) && (
            <div className="flex items-center gap-x-2 self-start mt-2.5">
              <div 
                className="flex items-center gap-x-2 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <CalendarIcon className="h-3 w-3 shrink-0" />
                  <span className="tabular-nums">
                    {new Date(item.dueDate).toLocaleDateString(undefined, {
                      dateStyle: 'medium'
                    })}
                  </span>
                </div>
                <div className="inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                  <span className="tabular-nums">
                    {new Date(item.dueDate).toLocaleTimeString(undefined, {
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center h-[22px] shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteItem(item.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full bg-zinc-100 hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-[#a1a1a1] dark:text-[#646464] h-6 w-6"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        </>
      ) : (
        <div className="flex-1 min-w-0 flex flex-col">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent border-none outline-none text-sm font-medium tracking-[0.005em] leading-[22px] h-[22px] text-[#1d1d1d] dark:text-zinc-100 dark:antialiased p-0 m-0 block"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <textarea
            placeholder="Notes"
            className="w-full bg-transparent border-none outline-none text-xs tracking-[0.005em] leading-none text-[#646464] dark:text-zinc-400 resize-none p-0 m-0 mt-0.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="flex items-center gap-x-2 mt-2.5">
            <DropdownMenu 
              open={isDropdownOpen} 
              onOpenChange={(open) => {
                setIsDropdownOpen(open);
                if (!open) {
                  setTimeout(() => setShowCustomPicker(false), 200);
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-x-2 cursor-pointer">
                  {!dueDate ? (
                    <button className="inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 px-2.5 py-1 transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      <CalendarIcon className="h-3 w-3 shrink-0" />
                      <span className="tabular-nums">Add Date</span>
                    </button>
                  ) : (
                    <>
                      <div className="group/pill inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 pl-2.5 pr-1 py-1 transition-colors duration-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        <CalendarIcon className="h-3 w-3 shrink-0" />
                        <span className="tabular-nums">
                          {new Date(dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                        <div 
                          role="button"
                          className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDueDate('');
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <X className="h-3 w-3 opacity-50 group-hover/pill:opacity-100 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </div>
                      <div className="group/pill inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 pl-2.5 pr-1.5 py-1 transition-colors duration-200 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="tabular-nums">
                          {new Date(dueDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </span>
                        <div 
                          role="button"
                          className="ml-0.5 rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDueDate('');
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <X className="h-3 w-3 opacity-50 group-hover/pill:opacity-100 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-auto z-[99999]" onClick={(e) => e.stopPropagation()}>
                {!showCustomPicker ? (
                  <div className="w-56">
                    <DropdownMenuItem onSelect={() => handleQuickDate('today')} className="text-xs font-medium cursor-pointer">
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleQuickDate('tomorrow')} className="text-xs font-medium cursor-pointer">
                      Tomorrow
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleQuickDate('weekend')} className="text-xs font-medium cursor-pointer">
                      This Weekend
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleQuickDate('next_week')} className="text-xs font-medium cursor-pointer">
                      Next Week
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={(e) => {
                        e.preventDefault();
                        setShowCustomPicker(true);
                      }} 
                      className="text-xs font-medium cursor-pointer"
                    >
                      Custom...
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <div className="p-1" onClick={(e) => e.stopPropagation()}>
                    <CustomDatePicker value={dueDate} onChange={setDueDate} />
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}


    </div>
  );
};
