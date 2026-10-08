export interface SkillGroup {
  group: string;
  skills: string[];
  hoverColor: string;
  hoverColorDark: string;
}

export const skillGroups: SkillGroup[] = [
  {
    group: "Languages",
    skills: ["Python", "JavaScript", "TypeScript"],
    hoverColor: "#915c26",
    hoverColorDark: "#e0bd99",
  },
  {
    group: "Frameworks & Libraries",
    skills: ["React", "Next.js", "Tailwind CSS", "Pygame", "OpenCV", "PySide6"],
    hoverColor: "#a78810",
    hoverColorDark: "#f0da8a",
  },
  {
    group: "Tools",
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
    hoverColor: "#83357d",
    hoverColorDark: "#d6a4d2",
  },
  {
    group: "AI / ML",
    skills: ["MediaPipe", "Computer Vision", "Hand Landmark Detection"],
    hoverColor: "#598334",
    hoverColorDark: "#bbd6a4",
  },
];
