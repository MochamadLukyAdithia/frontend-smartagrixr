"use client";

import dynamic from "next/dynamic";

const EditorLayout = dynamic(
  () => import("@/components/editor/ui/EditorLayout").then((mod) => mod.EditorLayout),
  { ssr: false }
);

export default function EditorPage() {
  return <EditorLayout />;
}
