"use client";

import { ElementRef, useRef, useState } from "react";
import { Calendar, CalendarDays, Inbox, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current) {
      setIsResetting(true);
      sidebarRef.current.style.width = "280px";
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "group/sidebar relative z-[99999] flex h-full w-[280px] flex-col overflow-y-auto border-r border-neutral-800 bg-[#1c1c1e] select-none",
        isResetting && "transition-all duration-300 ease-in-out"
      )}
    >
      <div className="flex-1 p-4">
        {/* 2x2 Smart Lists Grid - Now at the very top */}
        <div className="mb-6 grid grid-cols-2 gap-3 pt-2">
          <Link href="/today" className="flex h-20 flex-col justify-between rounded-xl bg-[#2c2c2e] p-3 transition hover:bg-neutral-800 shadow-sm border border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-sm"><Calendar className="h-4 w-4 text-white" /></div>
              <span className="text-xl font-bold text-white">0</span>
            </div>
            <span className="text-sm font-semibold text-neutral-400">Today</span>
          </Link>

          <Link href="/scheduled" className="flex h-20 flex-col justify-between rounded-xl bg-[#2c2c2e] p-3 transition hover:bg-neutral-800 shadow-sm border border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-sm"><CalendarDays className="h-4 w-4 text-white" /></div>
              <span className="text-xl font-bold text-white">0</span>
            </div>
            <span className="text-sm font-semibold text-neutral-400">Scheduled</span>
          </Link>

          <Link href="/all" className="flex h-20 flex-col justify-between rounded-xl bg-[#2c2c2e] p-3 transition hover:bg-neutral-800 shadow-sm border border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-600 shadow-sm"><Inbox className="h-4 w-4 text-white" /></div>
              <span className="text-xl font-bold text-white">0</span>
            </div>
            <span className="text-sm font-semibold text-neutral-400">All</span>
          </Link>

          <Link href="/completed" className="flex h-20 flex-col justify-between rounded-xl bg-[#2c2c2e] p-3 transition hover:bg-neutral-800 shadow-sm border border-neutral-800/50">
            <div className="flex items-center justify-between">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 shadow-sm"><Check className="h-4 w-4 text-white" /></div>
              <span className="text-xl font-bold text-white">0</span>
            </div>
            <span className="text-sm font-semibold text-neutral-400">Completed</span>
          </Link>
        </div>

        {/* Database Lists Section */}
        <div>
          <div className="group flex cursor-pointer items-center justify-between px-2 pb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span>My Lists</span>
            <Plus className="h-4 w-4 opacity-0 transition group-hover:opacity-100 hover:text-white" />
          </div>
          <div className="px-2 py-1 text-sm text-neutral-400">
            No lists found.
          </div>
        </div>
      </div>

      {/* Footer Pinned Actions */}
      <div className="border-t border-neutral-800 p-3">
        <Link href="/deleted" className="flex items-center gap-x-3 rounded-md px-2 py-2 text-sm text-neutral-400 transition hover:bg-[#2c2c2e] hover:text-white">
          <Trash2 className="h-4 w-4" />
          Recently Deleted
        </Link>
      </div>

      {/* Invisible Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={resetWidth}
        className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-neutral-700 opacity-0 transition group-hover/sidebar:opacity-100"
      />
    </aside>
  );
};