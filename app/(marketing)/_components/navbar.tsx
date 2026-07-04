"use client";

import { useConvexAuth } from "@/hooks/use-convex-shim";
import Link from "next/link";

import { useScrollTop } from "@/hooks/use-scroll-top";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const scrolled = useScrollTop();

  return (
    <div className={cn(
      "z-50 bg-background dark:bg-[#000000] fixed top-0 flex items-center w-full p-6",
      scrolled && "border-b shadow-sm"
    )}>
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && (
          <Spinner />
        )}
        {!isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-in">Get Reminders</Link>
            </Button>
          </>
        )}
        {isAuthenticated && !isLoading && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/documents">
                Open Reminders
              </Link>
            </Button>
          </>
        )}
        <ModeToggle />
      </div>
    </div>
  )
}