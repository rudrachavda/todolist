"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useScrollTop } from "@/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export const Navbar = () => {
  const scrolled = useScrollTop();

  return (
    <div className={cn(
      "z-50 bg-background/80 dark:bg-[#000000]/80 backdrop-blur-lg fixed top-0 flex items-center w-full p-6 transition-all",
      scrolled && "border-b shadow-sm py-4"
    )}>
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary">
          <Link href="/login">
            Log in
          </Link>
        </Button>
        <Button size="sm" asChild className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/main">
            Get Started
          </Link>
        </Button>
        <div className="pl-2 border-l border-border z-50">
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}