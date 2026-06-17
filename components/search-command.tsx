"use client";

import { useEffect, useState } from "react";
import { File, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { searchItems } from "@/actions/items";
import { Item as ItemDoc } from "@/db/schema";

export const SearchCommand = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItemDoc[]>([]);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  useEffect(() => {
    const fetchData = async () => {
        if (query.length > 0) {
            const data = await searchItems(query);
            setResults(data);
        } else {
            setResults([]);
        }
    };
    fetchData();
  }, [query]);

  const onSelect = (id: string, listId: string | null) => {
    if (listId) {
        router.push(`/lists/${listId}`);
    } else {
        // Fallback for items not in a list (though in our app they should be)
        router.push(`/all`);
    }
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput
        placeholder="Search reminders..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Reminders">
          {results.map((item) => (
            <CommandItem
              key={item.id}
              value={`${item.id}-${item.text}`}
              title={item.text}
              onSelect={() => onSelect(item.id, item.listId)}
            >
              <File className="mr-2 h-4 w-4" />
              <span>
                {item.text}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
