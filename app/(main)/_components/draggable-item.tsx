"use client";

import { useState, useRef, useEffect } from "react";
import { Circle, CheckCircle2, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useOnClickOutside } from "usehooks-ts";

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

export const DraggableItem = ({ item, onToggleCompletion, onDeleteItem, onUpdateItem, wrapperRef }: DraggableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [description, setDescription] = useState(item.description || '');
  const [dueDate, setDueDate] = useState(item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 16) : '');
  
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

  const handleSave = () => {
    setIsEditing(false);
    onUpdateItem(item.id, {
      text,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  useOnClickOutside(ref as any, () => {
    if (isEditing) {
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
      className="group flex items-start gap-x-3 py-3 border-b border-secondary/50 last:border-0 relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCompletion(item);
        }}
        className="mt-0.5 hover:opacity-75 transition"
      >
        {item.isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground" />
        )}
      </button>
      
      {!isEditing ? (
        <div 
          className="flex-1 space-y-0.5 cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
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
      ) : (
        <div className="flex-1 space-y-2">
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent border-none outline-none text-lg font-medium"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <textarea
            placeholder="Notes"
            className="w-full bg-transparent border-none outline-none text-sm text-muted-foreground resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="flex items-center gap-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input
              type="datetime-local"
              className="bg-transparent border-none outline-none text-sm text-muted-foreground"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      )}

      {!isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-red-500/10 rounded-md"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
        </button>
      )}
    </div>
  );
};
