"use client";

import { useConvexAuth } from "@/hooks/use-convex-shim";
import { redirect } from "next/navigation";

import { Spinner } from "@/components/spinner";
import { SearchCommand } from "@/components/search-command";
import { SettingsModal } from "@/components/modals/settings-modal";
import { Navigation } from "./_components/navigation";

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-full flex dark:bg-[#191919]">
      <Navigation />
      <main className="flex-1 h-full overflow-hidden flex flex-col pt-14 md:pt-0">
        <SearchCommand />
        <SettingsModal />
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
