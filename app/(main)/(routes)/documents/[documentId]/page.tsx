"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import React from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

interface DocumentIdPageProps {
  params: any;
};

const DocumentIdPage = ({
  params
}: DocumentIdPageProps) => {
  const settings = useSettings();
  const { documentId: rawId } = params as { documentId: string };
  const documentId = rawId?.split('-')[0];
  const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);

  const document = useQuery(api.documents.getById, {
    documentId: documentId as Id<'documents'>
  });

  const update = useMutation(api.documents.update);

  const onChange = (content: string) => {
    update({
      id: documentId as Id<'documents'>,
      content
    });
  };

  if (document === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className={cn(
          "mx-auto mt-10",
          !settings.isWidthIncreased && "md:max-w-3xl lg:max-w-4xl"
        )}>
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (document === null) {
    return <div>Not found</div>
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className={cn(
        "mx-auto",
        !settings.isWidthIncreased && "md:max-w-3xl lg:max-w-4xl"
      )}>
        <Toolbar initialData={document} />
        <Editor
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}

export default DocumentIdPage;
