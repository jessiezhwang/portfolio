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
    thumbnailColor: "#4f46e5",
    thumbnailTextColor: "#c7d2fe",
  },
  {
    title: "Hand Volume Controller",
    description:
      "A macOS desktop app that controls your system volume using real-time hand gesture recognition — thumbs up raises it, thumbs down lowers it, peace sign sets it to 100%. Built with Python, MediaPipe, OpenCV, and PySide6. Note: browsers block system volume control for security, so the in-browser demo only shows live gesture detection. Download the desktop app to get the full experience.",
    techStack: ["Python", "MediaPipe", "OpenCV", "PySide6"],
    // TODO: Replace with your real GitHub repo URL for HandTrackingMac
    githubUrl: "https://github.com/jessiezhwang/portfolio",
    isPlayable: true,
    isWebDemo: true,
    // TODO: Add a screen recording of the desktop app and paste the URL here
    // demoVideoUrl: "https://youtube.com/...",
    thumbnailColor: "#7c3aed",
    thumbnailTextColor: "#ddd6fe",
  },
  {
    // TODO: Replace with a real project
    title: "Project Placeholder",
    description:
      "Another future project placeholder. Swap this out once you have more projects to show. Aim for 3–5 total.",
    techStack: ["TypeScript", "Next.js"],
    githubUrl: "#",
    thumbnailColor: "#059669",
    thumbnailTextColor: "#a7f3d0",
  },
];
