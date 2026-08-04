"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function MinesweeperEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-zinc-50 dark:bg-zinc-900/50">
      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
        Game runs in WebAssembly via Pygbag. Click inside the game to focus it.
        Right-click to flag mines.
      </p>

      <div className="relative w-[480px] max-w-full">
        {/* Loading spinner shown until iframe fires onLoad */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        )}
        <iframe
          src="/minesweeper/index.html"
          width={480}
          height={520}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 w-full"
          title="Minesweeper Game"
          onLoad={() => setLoaded(true)}
          // Sandbox allows scripts and same-origin; needed for WASM
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
