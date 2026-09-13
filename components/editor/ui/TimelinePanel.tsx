"use client";

import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { Play, Pause, Square, Plus, Trash2, Film, Layers } from "lucide-react";

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

  const editor = useEditorInstance();

  const handlePlayToggle = () => {
    const ed = getEditorInstance();
    if (!ed) return;
    if (playing) {
      ed.animationManager.pause();
    } else {
      ed.animationManager.play();
    }
  };

  const handleStop = () => {
    const ed = getEditorInstance();
    if (ed) {
      ed.animationManager.stop();
    }
  };

  const handleClipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clipName = e.target.value;
    const ed = getEditorInstance();
    if (ed) {
      ed.animationManager.selectClip(clipName);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    const ed = getEditorInstance();
    if (ed) {
      ed.animationManager.setSpeed(newSpeed);
    }
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    const ed = getEditorInstance();
    if (ed) {
      ed.animationManager.scrubToTime(targetTime);
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
    <div className="h-16 bg-[#161619] border-t border-[#27272a] px-4 flex items-center gap-5 text-white select-none justify-between overflow-x-auto font-sans shadow-2xl">
      {/* Left: Scenes Manager */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Scenes:
        </span>
        <div className="flex items-center gap-1.5 bg-[#1e1e23] p-1 rounded-xl border border-zinc-800">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`bouncy-hover px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeSceneId === scene.id 
                  ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm" 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#28282f]"
              }`}
            >
              <span>{scene.name}</span>
              {!isPreviewMode && scenes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene.id);
                  }}
                  className="hover:text-rose-400 rounded p-0.5 text-zinc-500 transition-colors"
                  title="Hapus Scene"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {!isPreviewMode && (
            <button
              onClick={handleAddScene}
              className="bouncy-hover p-1.5 hover:bg-[#28282f] rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
              title="Tambah Scene Baru"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div className="h-7 w-[1px] bg-zinc-800 flex-shrink-0" />

      {/* Middle: Animation Scrub Timeline */}
      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePlayToggle}
            className={`bouncy-hover p-2 rounded-xl transition-all shadow-md ${
              playing 
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.3)]" 
                : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            }`}
            title={playing ? "Jeda" : "Putar"}
          >
            {playing ? <Pause className="w-4 h-4 stroke-[3]" /> : <Play className="w-4 h-4 stroke-[3] fill-current" />}
          </button>
          <button
            onClick={handleStop}
            className="bouncy-hover p-2 bg-[#1e1e23] hover:bg-[#25252b] border border-zinc-700 rounded-xl transition-all text-zinc-300 hover:text-white"
            title="Berhenti"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] text-zinc-400 font-bold font-mono min-w-[35px] bg-[#1e1e23] px-2 py-0.5 rounded-md border border-zinc-800">
            {formatTime(time)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.01"
            value={time}
            onChange={handleScrubChange}
            className="flex-1 accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            disabled={clips.length === 0}
          />
          <span className="text-[11px] text-zinc-400 font-bold font-mono min-w-[35px] bg-[#1e1e23] px-2 py-0.5 rounded-md border border-zinc-800">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Clip picker & Speed */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {clips.length > 0 && (
          <div className="flex items-center gap-1.5 bg-[#1e1e23] px-2.5 py-1 rounded-xl border border-zinc-700 text-xs">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={activeClip || ""}
              onChange={handleClipChange}
              className="bg-transparent text-xs text-white outline-none font-medium cursor-pointer"
            >
              {clips.map((clip) => (
                <option key={clip} value={clip} className="bg-[#1e1e23]">
                  {clip}
                </option>
              ))}
            </select>
          </div>
        )}

        <select
          value={speed}
          onChange={handleSpeedChange}
          className="bg-[#1e1e23] text-xs text-zinc-200 px-2.5 py-1.5 rounded-xl outline-none border border-zinc-700 font-bold cursor-pointer"
        >
          <option value="0.25" className="bg-[#1e1e23]">0.25x</option>
          <option value="0.5" className="bg-[#1e1e23]">0.5x</option>
          <option value="1.0" className="bg-[#1e1e23]">1.0x</option>
          <option value="1.5" className="bg-[#1e1e23]">1.5x</option>
          <option value="2.0" className="bg-[#1e1e23]">2.0x</option>
        </select>
      </div>
    </div>
  );
}

