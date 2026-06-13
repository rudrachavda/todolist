"use client";

import { useTheme } from "next-themes";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
};

const Editor = ({
  onChange,
  initialContent,
  editable
}: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  let parsedContent: PartialBlock[] | undefined = undefined;
  if (initialContent) {
    try {
      parsedContent = JSON.parse(initialContent) as PartialBlock[];
    } catch {
      parsedContent = undefined;
    }
  }

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    uploadFile: handleUpload,
  });

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
        onChange={() => {
          onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
        }}
      />
    </div>
  );
};

export default Editor;
