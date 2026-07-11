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
  Trash2,
  Pencil
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ElementRef, useEffect, useRef, useState, useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";
import Image from "next/image";
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
import { motion, useMotionValue, useTransform, animate, useMotionValueEvent, AnimatePresence } from "framer-motion";

const SNAP_POINTS = {
    LEFT: -96,
    CENTER: 0,
    RIGHT: 0,
};
const POSITION_THRESHOLD = 48;
const SPRING_CONFIG: any = { type: "spring", duration: 0.5, bounce: 0 };

import { SkeletonReveal } from "@/components/ui/skeleton-reveal";

const ListsSkeleton = () => (
  <div className="flex flex-col w-full opacity-60">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-x-2 py-2 pr-6 pl-[24px]">
        <div className="h-[24px] w-[24px] rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        <div className="h-[18px] w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
      </div>
    ))}
  </div>
);

export const Navigation = () => {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { lists, fetchLists: fetchListsStore, addLocalList, updateLocalList, removeLocalList, itemCounts, fetchItemCounts, listLoading } = useLists();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const navbarRef = useRef<ElementRef<"div">>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const [scrolledTitle, setScrolledTitle] = useState<{ text: string, color: string } | null>(null);

  useEffect(() => {
    const main = document.getElementById('main-scroll');
    if (!main) return;

    const handleScroll = () => {
      if (main.scrollTop > 60) {
         const h1 = main.querySelector('h1');
         if (h1) {
            setScrolledTitle({ text: h1.innerText, color: h1.style.color || 'inherit' });
         }
      } else {
         setScrolledTitle(null);
      }
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, [pathname]);

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
    } else if (sidebarRef.current && navbarRef.current) {
      const savedWidth = localStorage.getItem("sidebarWidth");
      if (savedWidth) {
        const width = parseInt(savedWidth, 10);
        setIsCollapsed(width < 150);
        sidebarRef.current.style.width = `${width}px`;
        navbarRef.current.style.setProperty("left", `${width}px`);
        navbarRef.current.style.setProperty("width", `calc(100% - ${width}px)`);
      }
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

    if (newWidth < 150) {
      setIsCollapsed(true);
      if (newWidth < 72) newWidth = 72;
    } else {
      setIsCollapsed(false);
      if (!isMobile && Math.abs(newWidth - 315) < 15) {
        newWidth = 315;
      }
      if (newWidth > 480) newWidth = 480;
    }

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

    if (sidebarRef.current && navbarRef.current) {
      const currentWidth = parseInt(sidebarRef.current.style.width, 10);
      let targetWidth = currentWidth;
      
      if (currentWidth < 150) {
        targetWidth = 72;
        setIsCollapsed(true);
      } else if (currentWidth < 240) {
        targetWidth = 240;
        setIsCollapsed(false);
      } else {
        setIsCollapsed(false);
      }

      sidebarRef.current.style.width = `${targetWidth}px`;
      navbarRef.current.style.setProperty("left", `${targetWidth}px`);
      navbarRef.current.style.setProperty("width", `calc(100% - ${targetWidth}px)`);
      localStorage.setItem("sidebarWidth", targetWidth.toString());
    }
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
      if (!isMobile) {
        localStorage.setItem("sidebarWidth", "315");
      }
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? "0" : "72px";
      navbarRef.current.style.setProperty("width", isMobile ? "100%" : "calc(100% - 72px)");
      navbarRef.current.style.setProperty("left", isMobile ? "0" : "72px");
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
          "group/sidebar h-full select-none bg-secondary dark:bg-[#121212] overflow-y-auto relative flex w-[315px] flex-col z-[99999]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "w-0"
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 transition hidden",
            isMobile && "block opacity-100"
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div className="flex items-center px-4 py-3 min-h-[50px] mb-2">
          {isCollapsed ? (
            <div 
              role="button" 
              onClick={resetWidth} 
              className="h-10 w-10 mx-auto hover:bg-neutral-300 dark:hover:bg-neutral-700/50 rounded-lg flex items-center justify-center transition cursor-pointer"
            >
              <Image src="/logo.svg" alt="Logo" width={22} height={22} className="dark:hidden object-contain" />
              <Image src="/logo-dark.svg" alt="Logo" width={22} height={22} className="hidden dark:block object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-x-2 w-full">
              <Image src="/logo.svg" alt="Logo" width={22} height={22} className="dark:hidden object-contain" />
              <Image src="/logo-dark.svg" alt="Logo" width={22} height={22} className="hidden dark:block object-contain" />
              <span className="font-bold text-lg tracking-tight">Reminders</span>
            </div>
          )}
        </div>
        <div>
          <Item
            label="Search"
            icon={Search}
            isSearch
            onClick={search.onOpen}
            active={search.isOpen}
            activeVariant="gray"
            isCollapsed={isCollapsed}
          />
          <Item
            label="Settings"
            icon={Settings}
            onClick={settings.onOpen}
            active={settings.isOpen}
            activeVariant="gray"
            isCollapsed={isCollapsed}
          />
        </div>
        {!isCollapsed ? (
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
        ) : (
          <div className="mt-4 flex flex-col gap-1 w-full items-center">
            <Item icon={Calendar} label="Today" isCollapsed={true} onClick={() => router.push("/today")} />
            <Item icon={Clock} label="Scheduled" isCollapsed={true} onClick={() => router.push("/scheduled")} />
            <Item icon={Inbox} label="All" isCollapsed={true} onClick={() => router.push("/all")} />
            <Item icon={CheckCircle2} label="Completed" isCollapsed={true} onClick={() => router.push("/completed")} />
          </div>
        )}
        <div className="mt-8 flex-1 overflow-y-auto">
          {!isCollapsed && <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Lists</h3>}
          <SkeletonReveal isLoading={listLoading} skeleton={<ListsSkeleton />} className="pb-4">
            <div className="space-y-1">
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
                      isCollapsed={isCollapsed}
                      openSwipeId={openSwipeId}
                      setOpenSwipeId={setOpenSwipeId}
                  />
              ))}
              <Item
                  onClick={handleCreateList}
                  icon={Plus}
                  label="Add List"
                  isCollapsed={isCollapsed}
              />
              <div className="pt-4 mt-4 border-t border-secondary-foreground/10">
                  <DroppableTrashItem
                      router={router}
                      pathname={pathname}
                      isCollapsed={isCollapsed}
                  />
              </div>
            </div>
          </SkeletonReveal>
        </div>
        <div className="mt-auto border-t border-secondary-foreground/10">
          <UserItem isCollapsed={isCollapsed} />
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0 z-[99999]"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          "absolute top-0 z-[99999] left-[315px] w-[calc(100%-315px)]",
          isResetting && "transition-all ease-in-out duration-300",
          isMobile && "left-0 w-full"
        )}
      >
        {!!params.documentId ? (
          <Navbar
            isCollapsed={isMobile && isCollapsed}
            onResetWidth={resetWidth}
          />
        ) : (
          <nav className={cn(
            "w-full flex items-center px-8 transition-all duration-300",
            scrolledTitle ? "bg-white/70 dark:bg-[#191919]/70 backdrop-blur-md border-b border-border/50 py-3 shadow-sm" : "bg-transparent pt-6 pb-2"
          )}>
            {(isMobile && isCollapsed) && (
              <MenuIcon 
                onClick={resetWidth} 
                role="button" 
                className="h-6 w-6 text-muted-foreground shrink-0 mr-4" 
              />
            )}
            <div className={cn(
               "flex items-center gap-x-2 transition-all duration-400 ease-in-out transform",
               scrolledTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            )}>
               {scrolledTitle && (
                  <span className="font-semibold text-lg" style={{ color: scrolledTitle.color }}>
                     {scrolledTitle.text}
                  </span>
               )}
            </div>
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
  isCollapsed?: boolean;
  openSwipeId: string | null;
  setOpenSwipeId: (id: string | null) => void;
}

const DroppableSidebarItem = ({ list, onUpdateList, onDeleteList, router, params, ListIcon, colors, itemCounts, isCollapsed, openSwipeId, setOpenSwipeId }: DroppableSidebarItemProps) => {
  const {setNodeRef, isOver} = useDroppable({
    id: list.id,
    data: {
      type: 'List',
      listId: list.id,
    },
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [editColor, setEditColor] = useState(list.color);
  
  useEffect(() => {
    if (settingsOpen) {
      setEditName(list.name);
      setEditColor(list.color);
    }
  }, [settingsOpen, list.name, list.color]);
  
  const handleSave = () => {
    onUpdateList(list.id, { name: editName, color: editColor });
    setSettingsOpen(false);
  };

  const x = useMotionValue(0);
  const [dragProgress, setDragProgress] = useState(0);

  useMotionValueEvent(x, "change", setDragProgress);

  useEffect(() => {
    if ((openSwipeId !== list.id || isCollapsed) && x.get() !== 0) {
      animate(x, SNAP_POINTS.CENTER as any, SPRING_CONFIG);
    }
  }, [openSwipeId, list.id, x, isCollapsed]);

  const handleDragEnd = () => {
    const currentX = x.get();
    if (Math.abs(currentX) > POSITION_THRESHOLD) {
      animate(
        x,
        (currentX > 0 ? SNAP_POINTS.RIGHT : SNAP_POINTS.LEFT) as any,
        SPRING_CONFIG
      );
    } else {
      animate(x, SNAP_POINTS.CENTER as any, SPRING_CONFIG);
    }
  };

  const showEdit = dragProgress < -40;
  const showDelete = dragProgress < -80;

  return (
    <>
      <div 
        ref={setNodeRef} 
        className={cn(
          "relative select-none overflow-hidden group",
          isOver && "ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <div className="absolute top-0 bottom-0 right-0 flex items-center justify-end px-3 gap-x-2 w-full z-0">
           <motion.button 
             animate={{ opacity: showEdit ? 1 : 0, scale: showEdit ? 1 : 0.5 }}
             initial={{ opacity: 0, scale: 0.5 }}
             onClick={(e) => { e.stopPropagation(); setSettingsOpen(true); animate(x, SNAP_POINTS.CENTER as any, SPRING_CONFIG); }}
             className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
           >
             <Pencil className="h-4 w-4" />
           </motion.button>
           <motion.button 
             animate={{ opacity: showDelete ? 1 : 0, scale: showDelete ? 1 : 0.5 }}
             initial={{ opacity: 0, scale: 0.5 }}
             onClick={(e) => { e.stopPropagation(); onDeleteList(list.id); animate(x, SNAP_POINTS.CENTER as any, SPRING_CONFIG); }}
             className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
           >
             <Trash2 className="h-4 w-4" />
           </motion.button>
        </div>

        <motion.div
          style={{ x }}
          drag={!isCollapsed ? "x" : false}
          dragConstraints={{ left: SNAP_POINTS.LEFT, right: SNAP_POINTS.RIGHT }}
          dragElastic={0.05}
          dragDirectionLock
          dragMomentum={false}
          onDragStart={() => setOpenSwipeId(list.id)}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 0.98 }}
          transition={SPRING_CONFIG}
          className="relative z-10 bg-[#f8f9fa] dark:bg-[#1d1d1d] cursor-grab active:cursor-grabbing"
        >
          <div onClick={(e) => {
             if (Math.abs(x.get()) > 5) {
               e.preventDefault();
               e.stopPropagation();
               animate(x, SNAP_POINTS.CENTER as any, SPRING_CONFIG);
               return;
             }
             router.push(`/lists/${list.id}`)
          }}>
            <Item 
                label={list.name}
                icon={ListIcon}
                color={list.color}
                count={itemCounts?.listCounts?.[list.id] || 0}
                active={params.listId === list.id}
                isCollapsed={isCollapsed}
            />
          </div>
        </motion.div>
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

const DroppableTrashItem = ({ router, pathname, isCollapsed }: { router: any, pathname: string, isCollapsed?: boolean }) => {
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
          isCollapsed={isCollapsed}
      />
    </div>
  );
};