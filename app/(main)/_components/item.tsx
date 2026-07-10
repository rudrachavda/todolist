"use client";

import {
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

interface ItemProps {
  id?: string;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
  actions?: React.ReactNode;
  color?: string;
  activeVariant?: "blue" | "gray";
  count?: number;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
  actions,
  color,
  activeVariant = "blue",
  count,
  onContextMenu,
}: ItemProps) => {
  const router = useRouter();

  const handleExpand = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    onExpand?.();
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      role="button"
      style={{
        paddingLeft: level ? `${(level * 12) + 24}px` : "24px"
      }}
      className={cn(
        "group min-h-[27px] text-sm font-medium tracking-[0.005em] leading-snug py-2 pr-6 w-full hover:bg-zinc-100 dark:hover:bg-zinc-800/50 flex items-center text-[#646464] dark:text-[#a1a1a1] transition-colors rounded-none",
        active && activeVariant === "blue" && "bg-blue-500 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-500 text-white dark:text-white antialiased",
        active && activeVariant === "gray" && "bg-zinc-200 dark:bg-zinc-800/80 text-[#1d1d1d] dark:text-zinc-100 antialiased"
      )}
    >
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">
          {documentIcon}
        </div>
      ) : color ? (
        <div 
          className="shrink-0 h-[24px] w-[24px] mr-2 rounded-full flex items-center justify-center shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon
            className="shrink-0 h-[14px] w-[14px] text-white drop-shadow-sm"
            strokeWidth={2.5}
          />
        </div>
      ) : (
        <Icon
          className="shrink-0 h-[18px] w-[18px] mr-2"
          style={{ color: (active && activeVariant === "blue") ? 'white' : undefined }}
        />
      )}
      <span 
        className={cn("truncate", color ? "text-foreground dark:text-zinc-100" : "")}
        style={{ color: (active && activeVariant === "blue") ? 'white' : undefined }}
      >
        {label}
      </span>
      <div className="ml-auto flex items-center justify-end relative h-full min-w-[24px]">
        {isSearch && (
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
        
        {count !== undefined && (
          <span className={cn(
             "text-xs font-medium transition-transform duration-200 ease-in-out absolute right-0",
             (active && activeVariant === "blue") ? "text-white/80" : "text-muted-foreground",
             actions ? "group-hover:-translate-x-6" : ""
          )}>
            {count}
          </span>
        )}

        {actions && (
          <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
        {!!id && !actions && (
          <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                asChild
              >
                <div
                  role="button"
                  className="h-full rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors p-[2px]"
                >
                  <MoreHorizontal className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 z-[99999]"
                align="start"
                side="right"
                forceMount
              >
                <DropdownMenuItem
                  className="group cursor-pointer text-xs font-medium text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-700 dark:focus:text-red-300 transition-colors"
                >
                  <Trash className="h-3.5 w-3.5 mr-2" />
                  Delete List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="text-[10px] font-medium tracking-[0.005em] text-[#646464] dark:text-zinc-500 p-2 text-center">
                  Last edited just now
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      style={{
        paddingLeft: level ? `${(level * 12) + 37}px` : "24px"
      }}
      className="flex gap-x-2 py-[3px] pr-6"
    >
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  )
}
