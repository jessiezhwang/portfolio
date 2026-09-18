export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  isPlayable?: boolean;
  isWebDemo?: boolean;       // true = browser demo (not full functionality)
  demoVideoUrl?: string;     // TODO: add YouTube/Loom URL when you record a demo
  thumbnailColor: string;
  thumbnailTextColor?: string;
  bannerImage?: string;
}

export const projects: Project[] = [
  {
    title: "Minesweeper",
    description:
      "A classic Minesweeper game built with Python and Pygame — 15×15 grid, 30 mines, flag support. Compiled to WebAssembly with Pygbag so you can play it right in the browser.",
    techStack: ["Python", "Pygame", "Pygbag", "WebAssembly"],
    // TODO: Replace with your real GitHub repo URL
    githubUrl: "https://github.com/jessiezhwang/portfolio",
    isPlayable: true,
    bannerImage: "/minesweeper/cover.png",
    thumbnailColor: "#4f46e5",
    thumbnailTextColor: "#c7d2fe",
  },
  {
    title: "Hand Volume Controller",
    description:
      "A macOS desktop app that controls system volume using hand gestures via webcam — thumbs up, thumbs down, or peace sign. Built with Python, MediaPipe, OpenCV, and PySide6.",
    techStack: ["Python", "MediaPipe", "OpenCV", "PySide6"],
    // TODO: Replace with your real GitHub repo URL for HandTrackingMac
    githubUrl: "https://github.com/jessiezhwang/portfolio",
    isPlayable: true,
    isWebDemo: true,
    bannerImage: "/handtracking/banner.png",
    // TODO: Add a screen recording of the desktop app and paste the URL here
    // demoVideoUrl: "https://youtube.com/...",
    thumbnailColor: "#7c3aed",
    thumbnailTextColor: "#ddd6fe",
  },
  {
    title: "N/A",
    description: "Coming soon.",
    techStack: [],
    githubUrl: "#",
    thumbnailColor: "#6b7280",
    thumbnailTextColor: "#d1d5db",
  },
];
