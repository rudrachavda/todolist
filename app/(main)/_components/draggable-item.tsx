"use client";

import { useState, useRef, useEffect } from "react";
import { Circle, CheckCircle2, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOnClickOutside } from "usehooks-ts";
import { motion } from "framer-motion";
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
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(12px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: "none" } }
};

export const DraggableItem = ({ item, onToggleCompletion, onDeleteItem, onUpdateItem, wrapperRef }: DraggableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [description, setDescription] = useState(item.description || '');
  const [dueDate, setDueDate] = useState(item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 16) : '');
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
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  const handleQuickDate = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'today':
        now.setHours(17, 0, 0, 0); // Today 5 PM
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
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
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
    <motion.div 
      variants={itemVariants}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      ref={setRefs} 
      style={style} 
      {...attributes} 
      {...(isEditing ? {} : listeners)}
      onClick={(e) => {
        // Prevent click from propagating if we are already editing
        if (isEditing) e.stopPropagation();
      }}
      className={cn(
        "group flex items-start gap-x-3 py-3 border-b-[0.5px] border-solid border-secondary/50 dark:border-secondary/30 last:border-0 relative",
        "transition-colors duration-200 ease-in-out",
        isDragging && "opacity-50"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(item);
        }}
        className="mt-0.5 hover:opacity-75 transition shrink-0"
      >
        {item.isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-zinc-900 fill-zinc-900 dark:text-zinc-100 dark:fill-zinc-100" />
        ) : (
          <Circle className="h-5 w-5 text-[#a1a1a1] dark:text-[#646464]" />
        )}
      </button>
      
      {!isEditing ? (
        <div 
          className="flex-1 cursor-text min-w-0 flex flex-col"
          onClick={() => setIsEditing(true)}
        >
          <p className={cn(
            "text-sm font-medium tracking-[0.005em] leading-[22px] h-[22px] text-[#1d1d1d] dark:text-zinc-100 dark:antialiased transition-colors truncate p-0 m-0",
            item.isCompleted && "text-[#a1a1a1] dark:text-[#646464] line-through decoration-[#a1a1a1]/30 dark:decoration-[#646464]/30"
          )}>
            {item.text}
          </p>
          {item.description && (
            <p className="text-xs tracking-[0.005em] leading-relaxed text-[#646464] dark:text-zinc-400 line-clamp-2 mt-0.5 p-0 m-0">
              {item.description}
            </p>
          )}
          {item.dueDate && (
            <div className="mt-2.5 flex items-center gap-x-2">
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
          )}
        </div>
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
            className="w-full bg-transparent border-none outline-none text-xs tracking-[0.005em] leading-relaxed text-[#646464] dark:text-zinc-400 resize-none p-0 m-0 mt-0.5"
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
                      <button className="inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 px-2.5 py-1 transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        <CalendarIcon className="h-3 w-3 shrink-0" />
                        <span className="tabular-nums">
                          {new Date(dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </button>
                      <button className="inline-flex items-center gap-x-1.5 rounded-full bg-zinc-100 px-2.5 py-1 transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="tabular-nums">
                          {new Date(dueDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-auto z-[99999]" onClick={(e) => e.stopPropagation()}>
                {!showCustomPicker ? (
                  <div className="w-56">
                    <DropdownMenuItem onClick={() => handleQuickDate('today')} className="text-xs font-medium cursor-pointer">
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickDate('tomorrow')} className="text-xs font-medium cursor-pointer">
                      Tomorrow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickDate('weekend')} className="text-xs font-medium cursor-pointer">
                      This Weekend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickDate('next_week')} className="text-xs font-medium cursor-pointer">
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

      {!isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md shrink-0 ml-2"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-[#a1a1a1] dark:text-[#646464] hover:text-[#1d1d1d] dark:hover:text-zinc-100" />
        </button>
      )}
    </motion.div>
  );
};
