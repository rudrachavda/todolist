import { Search, Plus, MoreHorizontal } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-neutral-800 bg-[#191919] px-6">
      {/* Left side (Empty for now, could be used for breadcrumbs or active list title) */}
      <div className="flex items-center">
        {/* Placeholder for future context */}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-x-4">
        {/* Search Bar */}
        <div className="flex w-64 items-center gap-x-2 rounded-md bg-[#2c2c2e] px-2 py-1.5 text-neutral-400 shadow-inner transition focus-within:ring-1 focus-within:ring-neutral-600">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 text-white"
          />
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-x-3 border-l border-neutral-800 pl-4">
          <button className="text-neutral-400 transition hover:text-white">
            <Plus className="h-5 w-5" />
          </button>
          <button className="text-neutral-400 transition hover:text-white">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};