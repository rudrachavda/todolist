"use client";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  Search,
  Settings,
  Calendar,
  Clock,
  Inbox,
  CheckCircle2,
  List as ListIcon
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { createList, getLists } from "@/actions/lists";
import { List } from "@/db/schema";

import { UserItem } from "./user-item";
import { Item } from "./item";
import { Navbar } from "./navbar";

export const Navigation = () => {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [userLists, setUserLists] = useState<List[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      const result = await getLists();
      setUserLists(result);
    };
    fetchLists();
  }, []);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
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

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty("left", `${newWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "100%" : "240px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 240px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "240px"
      );
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = "0";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
      setTimeout(() => setIsResetting(false), 300);
    }
  }

  const handleCreateList = async () => {
    const promise = createList("New List", "#0069cc")
      .then((list) => {
        setUserLists(prev => [list, ...prev]);
        router.push(`/lists/${list.id}`);
      })

    toast.promise(promise, {
      loading: "Creating a new list...",
      success: "New list created!",
      error: "Failed to create a new list."
    });
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar h-full select-none bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
            isMobile && "opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
          <Item
            label="Search"
            icon={Search}
            isSearch
            onClick={search.onOpen}
          />
          <Item
            label="Settings"
            icon={Settings}
            onClick={settings.onOpen}
          />
        </div>
        <div className="mt-4 px-3 grid grid-cols-2 gap-2">
            <div 
                onClick={() => router.push("/today")}
                className="bg-background dark:bg-neutral-800 p-2.5 rounded-xl flex flex-col gap-y-1 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-blue-500 p-1.5 rounded-full text-white">
                        <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold font-halo">0</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Today</span>
            </div>
            <div 
                onClick={() => router.push("/scheduled")}
                className="bg-background dark:bg-neutral-800 p-2.5 rounded-xl flex flex-col gap-y-1 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-red-500 p-1.5 rounded-full text-white">
                        <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold font-halo">0</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Scheduled</span>
            </div>
            <div 
                onClick={() => router.push("/all")}
                className="bg-background dark:bg-neutral-800 p-2.5 rounded-xl flex flex-col gap-y-1 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-neutral-500 p-1.5 rounded-full text-white">
                        <Inbox className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold font-halo">0</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">All</span>
            </div>
            <div 
                onClick={() => router.push("/completed")}
                className="bg-background dark:bg-neutral-800 p-2.5 rounded-xl flex flex-col gap-y-1 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
                <div className="flex justify-between items-start">
                    <div className="bg-neutral-400 p-1.5 rounded-full text-white">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold font-halo">0</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Completed</span>
            </div>
        </div>
        <div className="mt-8 px-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Lists</h3>
          <div className="space-y-1">
            {userLists.map((list) => (
                <Item 
                    key={list.id}
                    label={list.name}
                    icon={ListIcon}
                    onClick={() => router.push(`/lists/${list.id}`)}
                />
            ))}
            <Item
                onClick={handleCreateList}
                icon={Plus}
                label="Add List"
            />
          </div>
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar
            isCollapsed={isCollapsed}
            onResetWidth={resetWidth}
          />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && <MenuIcon onClick={resetWidth} role="button" className="h-6 w-6 text-muted-foreground" />}
          </nav>
        )}
      </div>
    </>
  )
}