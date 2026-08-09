export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  isPlayable?: boolean;
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
    githubUrl: "https://github.com/jessiewang",
    isPlayable: true,
    thumbnailColor: "#4f46e5",
    thumbnailTextColor: "#c7d2fe",
  },
  {
    // TODO: Replace with a real project
    title: "Project Placeholder 1",
    description:
      "Description of a future project. Replace this card with your real project — title, what it does, and why you built it.",
    techStack: ["Python", "React"],
    githubUrl: "#",
    thumbnailColor: "#0891b2",
    thumbnailTextColor: "#a5f3fc",
  },
  {
    // TODO: Replace with a real project
    title: "Project Placeholder 2",
    description:
      "Another future project placeholder. Swap this out once you have more projects to show. Aim for 3–5 total.",
    techStack: ["TypeScript", "Next.js"],
    githubUrl: "#",
    thumbnailColor: "#059669",
    thumbnailTextColor: "#a7f3d0",
  },
];
