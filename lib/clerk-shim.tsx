"use client";

import React from "react";

export const useUser = () => {
  return {
    user: {
      id: "user_1",
      fullName: "User",
      firstName: "User",
      imageUrl: "/logo.svg",
      emailAddresses: [{ emailAddress: "user@example.com" }]
    },
    isSignedIn: true,
  };
};

export const SignInButton = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <>{children}</>;
export const UserButton = (props: any) => <div className="h-8 w-8 rounded-full bg-secondary" />;
export const SignOutButton = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <>{children}</>;
export const ClerkProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const useAuth = () => ({ userId: "user_1" });
