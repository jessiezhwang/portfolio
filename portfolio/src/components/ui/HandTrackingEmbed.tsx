"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

// ─── Hand connections (same as Python version) ───────────────────────────────
const HAND_CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function dist(a: {x:number;y:number}, b: {x:number;y:number}) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
function isOpen(lm: {x:number;y:number}[], tip: number, mid: number) {
  return dist(lm[tip], lm[0]) > dist(lm[mid], lm[0]) * 1.12;
}
function isCurled(lm: {x:number;y:number}[], tip: number, mid: number) {
  return dist(lm[tip], lm[0]) < dist(lm[mid], lm[0]) * 1.20;
}

// ─── Gesture recognition ──────────────────────────────────────────────────────
function recognizeGesture(lm: {x:number;y:number}[]): string {
  const indexOpen  = isOpen(lm, 8, 6);
  const middleOpen = isOpen(lm, 12, 10);
  const ringCurled = isCurled(lm, 16, 14);
  const pinkyCurled = isCurled(lm, 20, 18);

  if (indexOpen && middleOpen && ringCurled && pinkyCurled) return "Peace sign ✌️";

  const allCurled = isCurled(lm, 8, 6) && isCurled(lm, 12, 10) && ringCurled && pinkyCurled;
  const tip = lm[4], joint = lm[3], base = lm[2], iBase = lm[5], wrist = lm[0];

  if (allCurled && tip.y < joint.y && tip.y < base.y && tip.y < iBase.y && tip.y < wrist.y + 0.05)
    return "Thumbs up 👍";
  if (allCurled && tip.y > joint.y && tip.y > base.y && tip.y > iBase.y && tip.y > wrist.y - 0.05)
    return "Thumbs down 👎";

  return "Other";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HandTrackingEmbed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [volume, setVolume] = useState(50);
  const [gesture, setGesture] = useState("Waiting...");
  const [action, setAction] = useState("—");
  const [status, setStatus] = useState<"idle"|"loading"|"running"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Refs for values used inside rAF loop (avoid stale closures)
  const volumeRef = useRef(50);
  const prevGestureRef = useRef("");
  const stableCountRef = useRef(0);
  const confirmedRef = useRef("Waiting...");
  const lastUpRef = useRef(0);
  const lastDownRef = useRef(0);
  const peaceSeenRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(-1);
  const landmarkerRef = useRef<unknown>(null);

  function applyGesture(g: string) {
    const now = performance.now();

    if (g === "Peace sign ✌️" && !peaceSeenRef.current) {
      const old = volumeRef.current;
      volumeRef.current = 100;
      setVolume(100);
      setAction(old < 100 ? "Set to 100%" : "Already at 100%");
      peaceSeenRef.current = true;
      return;
    }
    if (g !== "Peace sign ✌️") peaceSeenRef.current = false;

    if (g === "Thumbs up 👍" && now - lastUpRef.current >= 120) {
      const old = volumeRef.current;
      volumeRef.current = Math.min(100, old + 5);
      setVolume(volumeRef.current);
      setAction(volumeRef.current > old ? `+${volumeRef.current - old}%` : "At max");
      lastUpRef.current = now;
    }

    if (g === "Thumbs down 👎" && now - lastDownRef.current >= 120) {
      const old = volumeRef.current;
      volumeRef.current = Math.max(0, old - 5);
      setVolume(volumeRef.current);
      setAction(old > volumeRef.current ? `-${old - volumeRef.current}%` : "At min");
      lastDownRef.current = now;
    }

    if (g === "No hand" || g === "Other") setAction("—");
  }

  async function start() {
    setStatus("loading");
    try {
      // Dynamically import MediaPipe (avoids SSR issues)
      const { HandLandmarker, FilesetResolver } = await import(
        /* webpackIgnore: true */
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs" as string
      ) as { HandLandmarker: any; FilesetResolver: any };

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      const video = videoRef.current!;
      video.srcObject = stream;
      await new Promise<void>(res => { video.onloadeddata = () => res(); });

      setStatus("running");
      loop();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.includes("Permission") || msg.includes("NotAllowed")
        ? "Camera access denied. Please allow camera permissions and try again."
        : `Error: ${msg}`);
      setStatus("error");
    }
  }

  function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const lm = landmarkerRef.current as any;
    if (!video || !canvas || !lm) return;

    if (canvas.width !== video.videoWidth)  canvas.width  = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let detected = "No hand";

    if (video.currentTime !== lastTimeRef.current) {
      lastTimeRef.current = video.currentTime;
      const results = lm.detectForVideo(video, performance.now());

      if (results?.landmarks?.length) {
        const landmarks = results.landmarks[0];
        detected = recognizeGesture(landmarks);

        // Draw skeleton
        const w = canvas.width, h = canvas.height;
        const pts = landmarks.map((p: {x:number;y:number}) => ({ x: p.x * w, y: p.y * h }));
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        for (const [a, b] of HAND_CONNECTIONS) {
          ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
        }
        for (const pt of pts) {
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
        }
      }
    }

    // Stabilize gesture
    if (detected === prevGestureRef.current) {
      stableCountRef.current++;
    } else {
      prevGestureRef.current = detected;
      stableCountRef.current = 1;
    }
    if (stableCountRef.current >= 3) {
      confirmedRef.current = detected;
      setGesture(detected);
      applyGesture(detected);
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6 bg-zinc-50 dark:bg-zinc-900/50">

      {/* Warning banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Browser limitation:</span> Browsers block system volume control for security. This demo detects gestures live — but cannot change your computer&apos;s actual volume. Download the desktop app for full functionality.
        </p>
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Click below to start your camera and try the gesture detection.</p>
          <button
            onClick={start}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Start Camera
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="w-7 h-7 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading MediaPipe model...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-red-500 text-center max-w-xs">{errorMsg}</p>
          <button onClick={start} className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {(status === "running" || status === "loading") && (
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Camera feed */}
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>

          {/* Controls panel */}
          <div className="flex flex-col gap-3 lg:w-56">

            {/* Volume */}
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Volume</span>
                <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{volume}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${volume >= 80 ? "bg-green-500" : "bg-indigo-500"}`}
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>

            {/* Gesture */}
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Gesture</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{gesture}</span>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3 flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Action</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{action}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Gestures</p>
              {[["👍","Thumbs up — raise"],["👎","Thumbs down — lower"],["✌️","Peace — set 100%"]].map(([e, l]) => (
                <div key={l} className="flex items-center gap-2 py-1.5 border-t border-zinc-100 dark:border-zinc-700 first:border-0 first:pt-0">
                  <span className="text-base w-5 text-center">{e}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
