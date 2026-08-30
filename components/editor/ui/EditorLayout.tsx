"use client";

import { useEditorStore } from "../store/useEditorStore";
import { Toolbar } from "./Toolbar";
import { InspectorPanel } from "./InspectorPanel";
import { LeftToolbar } from "./LeftToolbar";
import { MediaDrawer } from "./MediaDrawer";
import { Viewport } from "./Viewport";
import { TimelinePanel } from "./TimelinePanel";
import { KeyboardShortcutManager } from "./KeyboardShortcutManager";
import { ARModal } from "./ARModal";
import { AnnotationOverlay } from "./AnnotationOverlay";

export function EditorLayout() {
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);

  return (
    <div className="flex flex-col w-screen h-screen bg-[#121212] font-sans text-white select-none overflow-hidden">
      {/* Keyboard shortcuts listener */}
      <KeyboardShortcutManager />

      {/* AR Conversion Barcode / QR Modal */}
      <ARModal />

      {/* Interactive 3D Hotspot & Info Dialog Overlay */}
      <AnnotationOverlay />

      {/* Top Navbar Toolbar */}
      <Toolbar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Toolbars: Hidden in Preview Mode */}
        {!isPreviewMode && (
          <div className="flex h-full flex-shrink-0 z-10">
            <LeftToolbar />
            <MediaDrawer />
          </div>
        )}

        {/* Center Canvas Viewport & Bottom Timeline */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Viewport />
          
          {/* Bottom Area: Hidden in Preview Mode */}
          {!isPreviewMode && <TimelinePanel />}
        </div>

        {/* Right Side: Object Inspector - Hidden in Preview Mode */}
        {!isPreviewMode && (
          <div className="flex-shrink-0 h-full z-10">
            <InspectorPanel />
          </div>
        )}
      </div>
    </div>
  );
}

