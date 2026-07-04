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
  List as ListIcon,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState, useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useLists } from "@/hooks/use-lists";
import { createList, updateList, deleteList } from "@/actions/lists";
import { getItemsCounts, moveItem } from "@/actions/items";
import { List } from "@/db/schema";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { UserItem } from "./user-item";
import { Item } from "./item";
import { Navbar } from "./navbar";
import { useDroppable } from "@dnd-kit/core";

export const Navigation = () => {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { lists, fetchLists: fetchListsStore, addLocalList, updateLocalList, removeLocalList, itemCounts, fetchItemCounts } = useLists();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const colors = [
    "#b64400", "#9659b9", "#ee98b7", "#0069cc", "#50aef6", 
    "#abcdef", "#169b40", "#0a461d", "#fcd609", "#fc9601", "#fc3e2f"
  ];

  const fetchLists = useCallback(async () => {
    await fetchListsStore();
  }, [fetchListsStore]);

  // Initial fetch for lists and counts
  useEffect(() => {
    fetchLists();
    fetchItemCounts();
  }, [fetchLists, fetchItemCounts]);

  // Refetch counts on navigation to ensure badges are fresh
  useEffect(() => {
    fetchItemCounts();
  }, [pathname, fetchItemCounts]);

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
        addLocalList(list);
        router.push(`/lists/${list.id}`);
      })

    toast.promise(promise, {
      loading: "Creating a new list...",
      success: "New list created!",
      error: "Failed to create a new list."
    });
  };

  const onUpdateList = async (id: string, values: Partial<{ name: string, color: string }>) => {
    updateLocalList(id, values);
    await updateList(id, values);
  };

  const onDeleteList = async (id: string) => {
    const promise = deleteList(id)
      .then(() => {
        removeLocalList(id);
        if (params.listId === id) {
          router.push("/documents");
        }
      });

    toast.promise(promise, {
      loading: "Deleting list...",
      success: "List deleted",
      error: "Failed to delete list"
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
                    <span className="text-xl font-bold font-halo text-foreground dark:text-[#a1a1a1]">{itemCounts.today}</span>
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
                    <span className="text-xl font-bold font-halo text-foreground dark:text-[#a1a1a1]">{itemCounts.scheduled}</span>
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
                    <span className="text-xl font-bold font-halo text-foreground dark:text-[#a1a1a1]">{itemCounts.all}</span>
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
                    <span className="text-xl font-bold font-halo text-foreground dark:text-[#a1a1a1]">{itemCounts.completed}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Completed</span>
            </div>
        </div>
        <div className="mt-8 px-3 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Lists</h3>
          <div className="space-y-1 pb-4">
            {lists.map((list) => (
                <DroppableSidebarItem 
                    key={list.id}
                    list={list}
                    onUpdateList={onUpdateList}
                    onDeleteList={onDeleteList}
                    router={router}
                    params={params}
                    ListIcon={ListIcon}
                    colors={colors}
                />
            ))}
            <Item
                onClick={handleCreateList}
                icon={Plus}
                label="Add List"
            />
            <div className="pt-4 mt-4 border-t border-secondary-foreground/10">
                <DroppableTrashItem
                    router={router}
                    pathname={pathname}
                />
            </div>
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

interface DroppableSidebarItemProps {
  list: List;
  onUpdateList: (id: string, values: Partial<{ name: string; color: string }>) => Promise<void>;
  onDeleteList: (id: string) => Promise<void>;
  router: any; // NextRouter
  params: any; // useParams
  ListIcon: any; // LucideIcon
  colors: string[];
}

const DroppableSidebarItem = ({ list, onUpdateList, onDeleteList, router, params, ListIcon, colors }: DroppableSidebarItemProps) => {
  const {setNodeRef, isOver} = useDroppable({
    id: list.id,
    data: {
      type: 'List',
      listId: list.id,
    },
  });

  return (
    <div ref={setNodeRef} className={cn(
      isOver && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      <Item 
          label={list.name}
          icon={ListIcon}
          color={list.color}
          onClick={() => router.push(`/lists/${list.id}`)}
          active={params.listId === list.id}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div role="button" className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 p-0.5">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start" side="right" forceMount onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => {
                  const newName = prompt("Rename list", list.name);
                  if (newName) onUpdateList(list.id, { name: newName });
                }}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteList(list.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  Delete List
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <div 
                      key={color}
                      onClick={() => onUpdateList(list.id, { color })}
                      className={cn(
                        "h-5 w-5 rounded-full cursor-pointer border border-white/20",
                        list.color === color && "ring-2 ring-primary ring-offset-1 dark:ring-offset-neutral-800"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          }
      />
    </div>
  );
};

const DroppableTrashItem = ({ router, pathname }: { router: any, pathname: string }) => {
  const {setNodeRef, isOver} = useDroppable({
    id: "trash",
    data: {
      type: 'Trash',
    },
  });

  return (
    <div ref={setNodeRef} className={cn(
      isOver && "ring-2 ring-red-500 ring-offset-2 rounded-sm"
    )}>
      <Item 
          label="Recently Deleted"
          icon={Trash2}
          onClick={() => router.push("/recently-deleted")}
          active={pathname === "/recently-deleted"}
      />
    </div>
  );
};