"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function HandTrackingEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-zinc-50 dark:bg-zinc-900/50">
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center max-w-sm">
        Live gesture detection in your browser via MediaPipe. Allow camera access when prompted.
        Note: browsers block system volume control — this demo detects gestures only.
      </p>

      <div className="relative w-full max-w-[900px]">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg min-h-[400px]">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        )}
        <iframe
          src="/handtracking/index.html"
          width="100%"
          height="520"
          className="rounded-lg border border-zinc-200 dark:border-zinc-700"
          title="Hand Gesture Demo"
          onLoad={() => setLoaded(true)}
          allow="camera"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
