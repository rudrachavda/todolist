"use client";

export const useEdgeStore = () => {
  return {
    edgestore: {
      publicFiles: {
        upload: async ({ file }: { file: File }) => {
          return { url: "" };
        },
        delete: async ({ url }: { url: string }) => {
          return;
        }
      }
    }
  };
};

export const EdgeStoreProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
