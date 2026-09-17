"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

const GAME_URL = "/minesweeper/index.html";

// How long to wait after the iframe's own document loads before offering the
// "open in a new tab" fallback. The iframe shell loads almost instantly, but
// the actual Python/WASM runtime (fetched live from a third-party CDN) can
// take several more seconds — longer, or indefinitely, if that CDN is
// unreachable (e.g. blocked by an ad blocker or network filter).
const STALL_TIMEOUT_MS = 12000;

export default function MinesweeperEmbed() {
  const [loaded, setLoaded] = useState(false);
  const [stalled, setStalled] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!loaded) return;

    const timer = setTimeout(() => {
      // Same-origin, so we can peek at the game's own "Loading, please
      // wait..." placeholder text to tell a genuine stall apart from a
      // player who just hasn't clicked to start yet.
      try {
        const doc = iframeRef.current?.contentDocument;
        const infobox = doc?.getElementById("infobox");
        if (infobox?.textContent?.includes("Loading")) {
          setStalled(true);
        }
      } catch {
        // Cross-origin or otherwise inaccessible — no way to tell, so stay quiet.
      }
    }, STALL_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [loaded]);

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
          ref={iframeRef}
          src={GAME_URL}
          width={480}
          height={520}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 w-full"
          title="Minesweeper Game"
          onLoad={() => setLoaded(true)}
          // Sandbox allows scripts and same-origin; needed for WASM
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {stalled && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center max-w-sm">
          Still loading after a while? Some ad blockers or networks block the
          third-party CDN this game loads from. Try opening it directly below.
        </p>
      )}

      <a
        href={GAME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
      >
        <ExternalLink size={12} />
        Open in a new tab
      </a>
    </div>
  );
}
