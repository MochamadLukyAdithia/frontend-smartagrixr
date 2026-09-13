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
    <div className="h-16 bg-white border-t border-slate-200 px-4 flex items-center gap-5 text-slate-800 select-none justify-between overflow-x-auto font-sans shadow-sm">
      {/* Left: Scenes Manager */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-emerald-600" /> Scenes:
        </span>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {scenes.map((scene) => (
            <div
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`bouncy-hover px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeSceneId === scene.id 
                  ? "bg-emerald-600 text-white font-bold shadow-xs" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
              }`}
            >
              <span>{scene.name}</span>
              {!isPreviewMode && scenes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteScene(scene.id);
                  }}
                  className="hover:text-rose-600 rounded p-0.5 text-slate-400 transition-colors"
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
              className="bouncy-hover p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-emerald-700 transition-colors"
              title="Tambah Scene Baru"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <div className="h-7 w-[1px] bg-slate-200 flex-shrink-0" />

      {/* Middle: Animation Scrub Timeline */}
      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePlayToggle}
            className={`bouncy-hover p-2 rounded-xl transition-all shadow-xs ${
              playing 
                ? "bg-amber-500 hover:bg-amber-400 text-white" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
            title={playing ? "Jeda" : "Putar"}
          >
            {playing ? <Pause className="w-4 h-4 stroke-[3]" /> : <Play className="w-4 h-4 stroke-[3] fill-current" />}
          </button>
          <button
            onClick={handleStop}
            className="bouncy-hover p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all text-slate-600 hover:text-slate-900"
            title="Berhenti"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] text-slate-700 font-bold font-mono min-w-[35px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {formatTime(time)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.01"
            value={time}
            onChange={handleScrubChange}
            className="flex-1 accent-emerald-600 bg-slate-200 h-1.5 rounded-lg cursor-pointer"
            disabled={clips.length === 0}
          />
          <span className="text-[11px] text-slate-700 font-bold font-mono min-w-[35px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Clip picker & Speed */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {clips.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
            <Film className="w-3.5 h-3.5 text-cyan-600" />
            <select
              value={activeClip || ""}
              onChange={handleClipChange}
              className="bg-transparent text-xs text-slate-900 outline-none font-medium cursor-pointer"
            >
              {clips.map((clip) => (
                <option key={clip} value={clip} className="bg-white">
                  {clip}
                </option>
              ))}
            </select>
          </div>
        )}

        <select
          value={speed}
          onChange={handleSpeedChange}
          className="bg-slate-100 text-xs text-slate-800 px-2.5 py-1.5 rounded-xl outline-none border border-slate-200 font-bold cursor-pointer"
        >
          <option value="0.25" className="bg-white">0.25x</option>
          <option value="0.5" className="bg-white">0.5x</option>
          <option value="1.0" className="bg-white">1.0x</option>
          <option value="1.5" className="bg-white">1.5x</option>
          <option value="2.0" className="bg-white">2.0x</option>
        </select>
      </div>
    </div>
  );
}

