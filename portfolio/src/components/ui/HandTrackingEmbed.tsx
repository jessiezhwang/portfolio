"use client";

import { useEffect, useRef, useState } from "react";

// Browser replica of HandTrackingMac/main.py — same window layout, gestures,
// timing, and labels. Browsers can't change system volume, so the volume here
// is simulated.

// ─── Settings (same as main.py) ───────────────────────────────────────────────
const CAMERA_WIDTH = 320;
const CAMERA_HEIGHT = 240;
const VOLUME_INCREASE_AMOUNT = 2;
const VOLUME_DECREASE_AMOUNT = 2;
const THUMBS_UP_INTERVAL_MS = 200;
const THUMBS_DOWN_INTERVAL_MS = 200;
const REQUIRED_GESTURE_CHECKS = 3;
const START_VOLUME = 50;

// Size of the Mac app window, used to scale the replica down in narrow cards
const WINDOW_WIDTH = 520;
const WINDOW_HEIGHT = 650;

const MEDIAPIPE_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// ─── Hand functions (ported from main.py) ─────────────────────────────────────
type Point = { x: number; y: number };

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

function pointDistance(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function fingerIsOpen(landmarks: Point[], tip: number, middle: number) {
  const wrist = landmarks[0];
  return pointDistance(landmarks[tip], wrist) > pointDistance(landmarks[middle], wrist) * 1.12;
}

function fingerIsCurled(landmarks: Point[], tip: number, middle: number) {
  const wrist = landmarks[0];
  return pointDistance(landmarks[tip], wrist) < pointDistance(landmarks[middle], wrist) * 1.2;
}

function recognizeGesture(landmarks: Point[]) {
  const wrist = landmarks[0];
  const thumbBase = landmarks[2];
  const thumbJoint = landmarks[3];
  const thumbTip = landmarks[4];
  const indexBase = landmarks[5];

  // Peace sign = 100%
  if (
    fingerIsOpen(landmarks, 8, 6) &&
    fingerIsOpen(landmarks, 12, 10) &&
    fingerIsCurled(landmarks, 16, 14) &&
    fingerIsCurled(landmarks, 20, 18)
  ) {
    return "Peace sign";
  }

  const allFingersCurled =
    fingerIsCurled(landmarks, 8, 6) &&
    fingerIsCurled(landmarks, 12, 10) &&
    fingerIsCurled(landmarks, 16, 14) &&
    fingerIsCurled(landmarks, 20, 18);

  const thumbPointsUp =
    thumbTip.y < thumbJoint.y &&
    thumbTip.y < thumbBase.y &&
    thumbTip.y < indexBase.y &&
    thumbTip.y < wrist.y + 0.05;

  if (allFingersCurled && thumbPointsUp) return "Thumbs up";

  const thumbPointsDown =
    thumbTip.y > thumbJoint.y &&
    thumbTip.y > thumbBase.y &&
    thumbTip.y > indexBase.y &&
    thumbTip.y > wrist.y - 0.05;

  if (allFingersCurled && thumbPointsDown) return "Thumbs down";

  return "Other gesture";
}

function drawHand(ctx: CanvasRenderingContext2D, landmarks: Point[]) {
  const points = landmarks.map((p) => ({
    x: Math.round(p.x * CAMERA_WIDTH),
    y: Math.round(p.y * CAMERA_HEIGHT),
  }));

  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = "#ffffff";
  ctx.lineWidth = 2;

  for (const [start, end] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(points[start].x, points[start].y);
    ctx.lineTo(points[end].x, points[end].y);
    ctx.stroke();
  }

  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
type Status = "starting" | "running" | "stopped" | "error";

export default function HandTrackingEmbed() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState<Status>("starting");
  const [cameraText, setCameraText] = useState("Starting camera...");
  const [statusText, setStatusText] = useState("Camera: Starting");
  const [volume, setVolume] = useState(START_VOLUME);
  const [gesture, setGesture] = useState("No hand");
  const [change, setChange] = useState("No change yet");

  // Values used inside the animation loop
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef(0);
  const runIdRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const volumeRef = useRef(START_VOLUME);
  const previousGestureRef = useRef("");
  const gestureCheckCountRef = useRef(0);
  const confirmedGestureRef = useRef("No hand");
  const peaceSignUsedRef = useRef(false);
  const lastThumbsUpTimeRef = useRef(0);
  const lastThumbsDownTimeRef = useRef(0);

  // Scale the fixed-size window down to fit narrow containers
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / WINDOW_WIDTH));
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  function stopCamera() {
    runIdRef.current++;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startCamera() {
    stopCamera();
    const runId = runIdRef.current;

    setStatus("starting");
    setCameraText("Starting camera...");
    setStatusText("Camera: Starting");

    try {
      if (!landmarkerRef.current) {
        const { HandLandmarker, FilesetResolver } = (await import(
          /* webpackIgnore: true */
          `${MEDIAPIPE_URL}/vision_bundle.mjs` as string
        )) as { HandLandmarker: any; FilesetResolver: any };

        const vision = await FilesetResolver.forVisionTasks(`${MEDIAPIPE_URL}/wasm`);

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      // Stopped or unmounted while loading
      if (runId !== runIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      if (runId !== runIdRef.current) return;

      lastVideoTimeRef.current = -1;
      setStatus("running");
      setStatusText("Camera: Running");
      rafRef.current = requestAnimationFrame(() => updateCamera(runId));
    } catch (err) {
      if (runId !== runIdRef.current) return;
      const name = err instanceof Error ? err.name : "";
      stopCamera();
      setStatus("error");
      setCameraText(
        name === "NotAllowedError"
          ? "Camera access denied"
          : "Could not start camera"
      );
      setStatusText("Camera: Could not read camera");
    }
  }

  function updateCamera(runId: number) {
    if (runId !== runIdRef.current) return;
    rafRef.current = requestAnimationFrame(() => updateCamera(runId));

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker) return;

    // Only process new camera frames. Re-running on repeated frames would
    // count "No hand" and break gesture stabilization.
    if (video.readyState < 2 || video.currentTime === lastVideoTimeRef.current) return;
    lastVideoTimeRef.current = video.currentTime;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== CAMERA_WIDTH * dpr) {
      canvas.width = CAMERA_WIDTH * dpr;
      canvas.height = CAMERA_HEIGHT * dpr;
    }

    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Mirrored camera frame, like cv2.flip(frame, 1)
    ctx.save();
    ctx.translate(CAMERA_WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
    ctx.restore();

    const result = landmarker.detectForVideo(video, performance.now());

    let detectedGesture = "No hand";

    if (result?.landmarks?.length) {
      // Mirror landmarks to match the flipped frame
      const landmarks: Point[] = result.landmarks[0].map((p: Point) => ({
        x: 1 - p.x,
        y: p.y,
      }));
      detectedGesture = recognizeGesture(landmarks);
      drawHand(ctx, landmarks);
    }

    // STABILIZE
    if (detectedGesture === previousGestureRef.current) {
      gestureCheckCountRef.current++;
    } else {
      previousGestureRef.current = detectedGesture;
      gestureCheckCountRef.current = 1;
      // Stop the previous action while a new gesture is being confirmed
      confirmedGestureRef.current = "Other gesture";
    }

    if (detectedGesture === "No hand" || detectedGesture === "Other gesture") {
      confirmedGestureRef.current = detectedGesture;
    } else if (gestureCheckCountRef.current >= REQUIRED_GESTURE_CHECKS) {
      confirmedGestureRef.current = detectedGesture;
    }

    const confirmed = confirmedGestureRef.current;
    const now = performance.now();
    let currentVolume = volumeRef.current;

    // PEACE SIGN = 100
    if (confirmed === "Peace sign") {
      if (!peaceSignUsedRef.current) {
        const amount = 100 - currentVolume;
        setChange(amount > 0 ? `Increased by ${amount}%` : "Already at 100%");
        currentVolume = 100;
        peaceSignUsedRef.current = true;
      }
    } else {
      peaceSignUsedRef.current = false;
    }

    // THUMBS UP
    if (
      confirmed === "Thumbs up" &&
      now - lastThumbsUpTimeRef.current >= THUMBS_UP_INTERVAL_MS
    ) {
      const newVolume = Math.min(100, currentVolume + VOLUME_INCREASE_AMOUNT);
      const amount = newVolume - currentVolume;
      setChange(amount > 0 ? `Increased by ${amount}%` : "Already at 100%");
      currentVolume = newVolume;
      lastThumbsUpTimeRef.current = now;
    }

    // THUMBS DOWN
    if (
      confirmed === "Thumbs down" &&
      now - lastThumbsDownTimeRef.current >= THUMBS_DOWN_INTERVAL_MS
    ) {
      const newVolume = Math.max(0, currentVolume - VOLUME_DECREASE_AMOUNT);
      const amount = currentVolume - newVolume;
      setChange(amount > 0 ? `Decreased by ${amount}%` : "Already at 0%");
      currentVolume = newVolume;
      lastThumbsDownTimeRef.current = now;
    }

    volumeRef.current = currentVolume;
    setVolume(currentVolume);
    setGesture(confirmed);

    // TEXT ON CAMERA (approximates cv2.FONT_HERSHEY_SIMPLEX, scale 0.5)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial, Helvetica, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`Gesture: ${confirmed}`, 10, 25);
    ctx.fillText(`Volume: ${currentVolume}%`, 10, 50);
  }

  function handleButton() {
    if (status === "stopped" || status === "error") {
      startCamera();
    } else {
      stopCamera();
      setStatus("stopped");
      setCameraText("Camera stopped");
      setStatusText("Camera: Stopped");
    }
  }

  // Start when the demo opens; release the camera when it closes
  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labelStyle = (size: number, bold = false): React.CSSProperties => ({
    height: 35,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size,
    fontWeight: bold ? 700 : 400,
    whiteSpace: "nowrap",
  });

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div
        ref={wrapperRef}
        className="w-full"
        style={{ maxWidth: WINDOW_WIDTH, height: WINDOW_HEIGHT * scale }}
      >
        {/* Replica of the HandVolumeWindow (520×650) */}
        <div
          style={{
            width: WINDOW_WIDTH,
            height: WINDOW_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            boxSizing: "border-box",
            padding: "22px 35px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "white",
            color: "black",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          {/* TITLE */}
          <div style={labelStyle(20, true)}>Hand Volume Controller</div>

          {/* CAMERA */}
          <div
            style={{
              position: "relative",
              width: CAMERA_WIDTH,
              height: CAMERA_HEIGHT,
              margin: "0 auto",
              background: "black",
              color: "white",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
            <canvas
              ref={canvasRef}
              style={{
                width: CAMERA_WIDTH,
                height: CAMERA_HEIGHT,
                display: "block",
                visibility: status === "running" ? "visible" : "hidden",
              }}
            />
            {status !== "running" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cameraText}
              </div>
            )}
          </div>

          {/* CURRENT VOLUME */}
          <div style={labelStyle(22, true)}>Current volume: {volume}%</div>

          {/* PROGRESS BAR */}
          <div
            style={{
              position: "relative",
              height: 20,
              boxSizing: "border-box",
              border: "1px solid #bdbdbd",
              borderRadius: 5,
              background: "#eeeeee",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: `${volume}%`,
                background: "#4c89ff",
                borderRadius: 4,
              }}
            />
            <div
              style={{
                position: "relative",
                lineHeight: "18px",
                fontSize: 13,
              }}
            >
              {volume}%
            </div>
          </div>

          {/* GESTURE */}
          <div style={labelStyle(15)}>Gesture: {gesture}</div>

          {/* CHANGE */}
          <div style={labelStyle(15)}>Change: {change}</div>

          {/* CAMERA STATUS */}
          <div style={labelStyle(11)}>{statusText}</div>

          {/* INSTRUCTIONS */}
          <div
            style={{
              height: 56,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              fontSize: 12,
              lineHeight: "14px",
              whiteSpace: "nowrap",
            }}
          >
            <div>Thumbs up = increase volume by {VOLUME_INCREASE_AMOUNT}%</div>
            <div>Thumbs down = decrease volume by {VOLUME_DECREASE_AMOUNT}%</div>
            <div>Peace sign = set volume to 100%</div>
          </div>

          {/* STOP BUTTON */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleButton}
              className="bg-[#eeeeee] hover:bg-[#dddddd]"
              style={{
                width: 125,
                height: 35,
                border: "1px solid #aaaaaa",
                borderRadius: 5,
                fontSize: 14,
                color: "black",
                fontFamily: "inherit",
              }}
            >
              {status === "stopped" || status === "error" ? "Start Program" : "Stop Program"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-[520px]">
        Browsers can&apos;t change your computer&apos;s volume, so this demo
        simulates it. The desktop app controls your real system volume.
      </p>
    </div>
  );
}
