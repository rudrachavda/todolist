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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

    if (newWidth < 315) newWidth = 315;
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

      sidebarRef.current.style.width = isMobile ? "100%" : "315px";
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : "calc(100% - 315px)"
      );
      navbarRef.current.style.setProperty(
        "left",
        isMobile ? "100%" : "315px"
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
          "group/sidebar h-full select-none bg-secondary dark:bg-[#121212] overflow-y-auto relative flex w-60 flex-col z-[99999]",
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
            active={search.isOpen}
            activeVariant="gray"
          />
          <Item
            label="Settings"
            icon={Settings}
            onClick={settings.onOpen}
            active={settings.isOpen}
            activeVariant="gray"
          />
        </div>
        <div className="mt-4 px-3 grid grid-cols-2 gap-2">
            <div 
                onClick={() => router.push("/today")}
                className={cn(
                  "p-3 rounded-xl flex flex-col cursor-pointer transition shadow-sm",
                  "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                )}
            >
                <div className="flex justify-between items-start">
                    <div className="text-white drop-shadow-sm">
                        <Calendar className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">{itemCounts.today}</span>
                </div>
                <span className="text-[13px] font-semibold text-white drop-shadow-sm mt-3">Today</span>
            </div>
            <div 
                onClick={() => router.push("/scheduled")}
                className={cn(
                  "p-3 rounded-xl flex flex-col cursor-pointer transition shadow-sm",
                  "bg-gradient-to-br from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
                )}
            >
                <div className="flex justify-between items-start">
                    <div className="text-white drop-shadow-sm">
                        <Clock className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">{itemCounts.scheduled}</span>
                </div>
                <span className="text-[13px] font-semibold text-white drop-shadow-sm mt-3">Scheduled</span>
            </div>
            <div 
                onClick={() => router.push("/all")}
                className={cn(
                  "p-3 rounded-xl flex flex-col cursor-pointer transition shadow-sm",
                  "bg-gradient-to-br from-zinc-600 to-zinc-800 hover:from-zinc-700 hover:to-zinc-900"
                )}
            >
                <div className="flex justify-between items-start">
                    <div className="text-white drop-shadow-sm">
                        <Inbox className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">{itemCounts.all}</span>
                </div>
                <span className="text-[13px] font-semibold text-white drop-shadow-sm mt-3">All</span>
            </div>
            <div 
                onClick={() => router.push("/completed")}
                className={cn(
                  "p-3 rounded-xl flex flex-col cursor-pointer transition shadow-sm",
                  "bg-gradient-to-br from-slate-400 to-slate-600 hover:from-slate-500 hover:to-slate-700"
                )}
            >
                <div className="flex justify-between items-start">
                    <div className="text-white drop-shadow-sm">
                        <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-bold leading-none text-white drop-shadow-sm">{itemCounts.completed}</span>
                </div>
                <span className="text-[13px] font-semibold text-white drop-shadow-sm mt-3">Completed</span>
            </div>
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">
          <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Lists</h3>
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
                    itemCounts={itemCounts}
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
          "absolute top-0 z-[99999] left-60 w-[calc(100%-315px)]",
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
  itemCounts: any;
}

const DroppableSidebarItem = ({ list, onUpdateList, onDeleteList, router, params, ListIcon, colors, itemCounts }: DroppableSidebarItemProps) => {
  const {setNodeRef, isOver} = useDroppable({
    id: list.id,
    data: {
      type: 'List',
      listId: list.id,
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [editColor, setEditColor] = useState(list.color);
  
  const [isPressing, setIsPressing] = useState(false);
  const [pressPos, setPressPos] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);
  
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const animTimer = useRef<NodeJS.Timeout | null>(null);
  const showUITimer = useRef<NodeJS.Timeout | null>(null);
  const wasLongPress = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setPressPos({ x: e.clientX, y: e.clientY });
    setProgress(0);
    wasLongPress.current = false;

    showUITimer.current = setTimeout(() => {
      setIsPressing(true);
      animTimer.current = setTimeout(() => {
        setProgress(100);
      }, 10);
    }, 150); // Delay showing UI so regular clicks don't flash it

    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      wasLongPress.current = true;
      setMenuOpen(true);
    }, 500);
  };

  const cancelPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (animTimer.current) clearTimeout(animTimer.current);
    if (showUITimer.current) clearTimeout(showUITimer.current);
  };

  const handleMouseUp = () => {
    cancelPress();
  };

  const handleSave = () => {
    onUpdateList(list.id, { name: editName, color: editColor });
    setSettingsOpen(false);
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        className={cn(
          "relative select-none",
          isOver && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <div
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={cancelPress}
          onClickCapture={(e) => {
            if (wasLongPress.current) {
              e.stopPropagation();
              e.preventDefault();
              wasLongPress.current = false;
            }
          }}
        >
          <Item 
              label={list.name}
              icon={ListIcon}
              color={list.color}
              count={itemCounts?.listCounts?.[list.id] || 0}
              onClick={() => router.push(`/lists/${list.id}`)}
              active={params.listId === list.id}
          />
        </div>

        {isPressing && (
          <div 
            className="fixed z-[999999] pointer-events-none"
            style={{ left: pressPos.x - 15, top: pressPos.y + 15 }}
          >
            <div className="w-[30px] h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden shadow-sm border border-neutral-300 dark:border-neutral-700">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all ease-linear"
                style={{ 
                  width: `${progress}%`, 
                  transitionDuration: progress === 100 ? '350ms' : '0ms' 
                }} 
              />
            </div>
          </div>
        )}

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div 
              className="fixed pointer-events-none opacity-0" 
              style={{ left: pressPos.x, top: pressPos.y, width: 1, height: 1 }} 
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="start" side="bottom">
            <DropdownMenuItem onSelect={(e) => {
              e.preventDefault(); // Prevent dropdown from closing immediately
              setMenuOpen(false); // Close dropdown manually
              setTimeout(() => setSettingsOpen(true), 10); // Safely open dialog
            }}>
              Edit List
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={() => onDeleteList(list.id)}
              className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                {colors.map((color) => (
                  <div 
                    key={color}
                    onClick={() => setEditColor(color)}
                    className={cn(
                      "h-8 w-8 rounded-full cursor-pointer border border-white/20 transition-all",
                      editColor === color ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-neutral-900 scale-110" : "hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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