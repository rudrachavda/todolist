"use client";

import { ReactNode } from "react";

export const ConvexClientProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  // We're bypassing Convex/Clerk for now to get the app to render with Drizzle/SQLite
  // This provider will just be a passthrough.
  return (
    <>
      {children}
    </>
  );
};
