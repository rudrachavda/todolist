"use client";

import { useUser } from "@/lib/clerk-shim";
import { PlusCircle, Calendar, Clock, Inbox, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createList } from "@/actions/lists";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const DocumentsPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const onCreateList = () => {
    const promise = createList("New List", "#0069cc")
      .then((list) => router.push(`/lists/${list.id}`))

    toast.promise(promise, {
      loading: "Creating a new list...",
      success: "New list created!",
      error: "Failed to create a new list."
    });
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.fullName || "User"}
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your reminders today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", icon: Calendar, color: "bg-blue-500", count: 0, route: "/today" },
          { label: "Scheduled", icon: Clock, color: "bg-red-500", count: 0, route: "/scheduled" },
          { label: "All", icon: Inbox, color: "bg-neutral-500", count: 0, route: "/all" },
          { label: "Completed", icon: CheckCircle2, color: "bg-neutral-400", count: 0, route: "/completed" },
        ].map((filter) => (
          <div 
            key={filter.label}
            onClick={() => router.push(filter.route)}
            className="bg-secondary/50 p-4 rounded-2xl flex flex-col gap-y-4 cursor-pointer hover:bg-secondary transition border border-transparent hover:border-border"
          >
            <div className="flex justify-between items-start">
              <div className={cn(filter.color, "p-2 rounded-full text-white")}>
                <filter.icon className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{filter.count}</span>
            </div>
            <span className="text-lg font-semibold text-muted-foreground">{filter.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-8 border-t">
        <h3 className="text-xl font-semibold">Quick Actions</h3>
        <Button onClick={onCreateList}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create a new list
        </Button>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export default DocumentsPage;