"use client";

import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { Play, Pause, Square, Plus, Trash2 } from "lucide-react";

export function TimelinePanel() {
  const { 
    animationState, 
    scenes, 
    activeSceneId, 
    setActiveSceneId, 
    addScene, 
    deleteScene,
    isPreviewMode 
  } = useEditorStore();
  const { playing, speed, duration, time, clips, activeClip } = animationState;

  const editor = getEditorInstance();

  const handlePlayToggle = () => {
    if (!editor) return;
    if (playing) {
      editor.animationManager.pause();
    } else {
      editor.animationManager.play();
    }
  };

  const handleStop = () => {
    if (editor) {
      editor.animationManager.stop();
    }
  };

  const handleClipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clipName = e.target.value;
    if (editor) {
      editor.animationManager.selectClip(clipName);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    if (editor) {
      editor.animationManager.setSpeed(newSpeed);
    }
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (editor) {
      editor.animationManager.scrubToTime(targetTime);
    }
  };

  const formatTime = (t: number) => {
    const sec = Math.floor(t);
    const ms = Math.floor((t - sec) * 100);
    return `${sec.toString().padStart(2, "0")}:${ms.toString().padStart(2, "0")}`;
  };

  const handleAddScene = () => {
    const name = `Scene ${scenes.length + 1}`;
    addScene(name);
  };

  return (
    <div className="h-20 bg-[#1e1e1e] border-t border-[#2a2a2a] px-4 flex items-center gap-6 text-white select-none justify-between overflow-x-auto">
      {/* Left: Scenes Manager */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Scenes:</span>
        <div className="flex items-center gap-1.5 bg-[#171717] p-1 rounded-lg">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeSceneId === scene.id 
                  ? "bg-[#22a447] text-white shadow-sm" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>{scene.name}</span>
              {!isPreviewMode && scenes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene.id);
                  }}
                  className="hover:text-red-500 rounded p-0.5 text-gray-500"
                  title="Delete Scene"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {!isPreviewMode && (
            <button
              onClick={handleAddScene}
              className="p-1 hover:bg-[#2a2a2a] rounded-lg text-gray-400 hover:text-white"
              title="Add New Scene"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="h-10 w-[1px] bg-[#2a2a2a] flex-shrink-0" />

      {/* Middle: Animation Scrub Timeline */}
      <div className="flex-1 flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePlayToggle}
            className={`p-2.5 rounded-full ${playing ? "bg-amber-500 hover:bg-amber-600" : "bg-[#22a447] hover:bg-[#198b3a]"} transition-all`}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={handleStop}
            className="p-2.5 bg-[#2a2a2a] hover:bg-[#333333] rounded-full transition-all text-gray-300"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold font-mono min-w-[35px]">
            {formatTime(time)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.01"
            value={time}
            onChange={handleScrubChange}
            className="flex-1 accent-[#22a447] bg-[#2a2a2a] h-1 rounded-lg cursor-pointer"
            disabled={clips.length === 0}
          />
          <span className="text-xs text-gray-400 font-semibold font-mono min-w-[35px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Clip picker & Speed */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {clips.length > 0 && (
          <select
            value={activeClip || ""}
            onChange={handleClipChange}
            className="bg-[#2a2a2a] text-xs text-white px-2.5 py-1.5 rounded outline-none border border-[#333]"
          >
            {clips.map((clip) => (
              <option key={clip} value={clip}>
                {clip}
              </option>
            ))}
          </select>
        )}

        <select
          value={speed}
          onChange={handleSpeedChange}
          className="bg-[#2a2a2a] text-xs text-white px-2.5 py-1.5 rounded outline-none border border-[#333]"
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="1.0">1.0x</option>
          <option value="1.5">1.5x</option>
          <option value="2.0">2.0x</option>
        </select>
      </div>
    </div>
  );
}
