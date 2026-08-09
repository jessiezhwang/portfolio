"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

export default function HandTrackingEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col gap-3 p-6 bg-zinc-50 dark:bg-zinc-900/50">

      {/* Warning banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Browser limitation:</span> Browsers block access to your system volume for security reasons. This demo detects your hand gestures live via webcam — but cannot change your computer&apos;s actual volume. Download the desktop app for full functionality.
        </p>
      </div>

      {/* Camera hint */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        Allow camera access when the browser prompts you. Works best in Chrome or Edge.
      </p>

      {/* iframe */}
      <div className="relative w-full">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg min-h-[520px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
              <p className="text-xs text-zinc-400">Loading MediaPipe...</p>
            </div>
          </div>
        )}
        <iframe
          src="/handtracking/index.html"
          width="100%"
          height="520"
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 block"
          title="Hand Gesture Demo"
          onLoad={() => setLoaded(true)}
          allow="camera; microphone"
        />
      </div>
    </div>
  );
}
