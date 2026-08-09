import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

// =============================================
// SETTINGS
// =============================================

const VOLUME_STEP = 5;
const THUMBS_INTERVAL_MS = 120;
const REQUIRED_STABLE_FRAMES = 3;

// =============================================
// DOM REFS
// =============================================

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cameraStatus = document.getElementById("camera-status");
const volumeNumber = document.getElementById("volume-number");
const volumeBarFill = document.getElementById("volume-bar-fill");
const gestureDisplay = document.getElementById("gesture-display");
const actionDisplay = document.getElementById("action-display");

// =============================================
// STATE
// =============================================

let volume = 50;
let handLandmarker = null;
let lastThumbsUpTime = 0;
let lastThumbsDownTime = 0;
let previousGesture = "";
let gestureCheckCount = 0;
let confirmedGesture = "Waiting";
let peaceSeen = false;

// =============================================
// HAND CONNECTIONS (same as Python version)
// =============================================

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],
  [0,17],
];

// =============================================
// GEOMETRY HELPERS
// =============================================

function pointDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function fingerIsOpen(lm, tip, mid) {
  const wrist = lm[0];
  return pointDistance(lm[tip], wrist) > pointDistance(lm[mid], wrist) * 1.12;
}

function fingerIsCurled(lm, tip, mid) {
  const wrist = lm[0];
  return pointDistance(lm[tip], wrist) < pointDistance(lm[mid], wrist) * 1.20;
}

// =============================================
// GESTURE RECOGNITION (ported from main.py)
// =============================================

function recognizeGesture(lm) {
  // Peace sign: index + middle open, ring + pinky curled
  const indexOpen   = fingerIsOpen(lm, 8, 6);
  const middleOpen  = fingerIsOpen(lm, 12, 10);
  const ringCurled  = fingerIsCurled(lm, 16, 14);
  const pinkyCurled = fingerIsCurled(lm, 20, 18);

  if (indexOpen && middleOpen && ringCurled && pinkyCurled) {
    return "Peace sign";
  }

  // All fingers curled?
  const indexCurled  = fingerIsCurled(lm, 8, 6);
  const middleCurled = fingerIsCurled(lm, 12, 10);
  const allCurled = indexCurled && middleCurled && ringCurled && pinkyCurled;

  const thumbTip   = lm[4];
  const thumbJoint = lm[3];
  const thumbBase  = lm[2];
  const indexBase  = lm[5];
  const wrist      = lm[0];

  // Thumbs up
  if (
    allCurled &&
    thumbTip.y < thumbJoint.y &&
    thumbTip.y < thumbBase.y &&
    thumbTip.y < indexBase.y &&
    thumbTip.y < wrist.y + 0.05
  ) {
    return "Thumbs up";
  }

  // Thumbs down
  if (
    allCurled &&
    thumbTip.y > thumbJoint.y &&
    thumbTip.y > thumbBase.y &&
    thumbTip.y > indexBase.y &&
    thumbTip.y > wrist.y - 0.05
  ) {
    return "Thumbs down";
  }

  return "Other gesture";
}

// =============================================
// VOLUME UI
// =============================================

function setVolume(newVol) {
  volume = Math.max(0, Math.min(100, newVol));
  volumeNumber.textContent = `${volume}%`;
  volumeBarFill.style.width = `${volume}%`;
  volumeBarFill.classList.toggle("high", volume >= 80);
}

function applyGesture(gesture) {
  const now = performance.now();

  if (gesture === "Peace sign" && !peaceSeen) {
    const old = volume;
    setVolume(100);
    actionDisplay.textContent = old < 100 ? `Set to 100%` : "Already at 100%";
    peaceSeen = true;
    return;
  }

  if (gesture !== "Peace sign") {
    peaceSeen = false;
  }

  if (gesture === "Thumbs up") {
    if (now - lastThumbsUpTime >= THUMBS_INTERVAL_MS) {
      const old = volume;
      setVolume(volume + VOLUME_STEP);
      const delta = volume - old;
      actionDisplay.textContent = delta > 0 ? `+${delta}%` : "At max";
      lastThumbsUpTime = now;
    }
    return;
  }

  if (gesture === "Thumbs down") {
    if (now - lastThumbsDownTime >= THUMBS_INTERVAL_MS) {
      const old = volume;
      setVolume(volume - VOLUME_STEP);
      const delta = old - volume;
      actionDisplay.textContent = delta > 0 ? `-${delta}%` : "At min";
      lastThumbsDownTime = now;
    }
    return;
  }

  if (gesture === "No hand") {
    actionDisplay.textContent = "—";
  }
}

// =============================================
// DRAW HAND SKELETON
// =============================================

function drawHand(landmarks) {
  const w = canvas.width;
  const h = canvas.height;

  // Convert normalized coords to canvas pixels
  // Note: canvas is CSS-mirrored via transform, so x is NOT flipped here
  const pts = landmarks.map(lm => ({
    x: lm.x * w,
    y: lm.y * h,
  }));

  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;

  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(pts[a].x, pts[a].y);
    ctx.lineTo(pts[b].x, pts[b].y);
    ctx.stroke();
  }

  for (const pt of pts) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

// =============================================
// DETECTION LOOP
// =============================================

let lastVideoTime = -1;

function detect() {
  if (!handLandmarker) {
    requestAnimationFrame(detect);
    return;
  }

  // Sync canvas size to video
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;

    const results = handLandmarker.detectForVideo(video, performance.now());

    let detectedGesture = "No hand";

    if (results.landmarks && results.landmarks.length > 0) {
      const lm = results.landmarks[0];
      detectedGesture = recognizeGesture(lm);
      drawHand(lm);
    }

    // Stabilize: require REQUIRED_STABLE_FRAMES consistent frames
    if (detectedGesture === previousGesture) {
      gestureCheckCount++;
    } else {
      previousGesture = detectedGesture;
      gestureCheckCount = 1;
    }

    if (gestureCheckCount >= REQUIRED_STABLE_FRAMES) {
      confirmedGesture = detectedGesture;
    }

    gestureDisplay.textContent = confirmedGesture;
    applyGesture(confirmedGesture);
  }

  requestAnimationFrame(detect);
}

// =============================================
// INIT
// =============================================

async function init() {
  // Load MediaPipe
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
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

  // Start webcam
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    });

    video.srcObject = stream;

    video.addEventListener("loadeddata", () => {
      cameraStatus.classList.add("hidden");
      detect();
    });

  } catch (err) {
    cameraStatus.querySelector("span").textContent =
      "Camera access denied. Please allow camera permissions and reload.";
    cameraStatus.querySelector(".spinner").style.display = "none";
    console.error("Camera error:", err);
  }
}

init();
