export interface SkillGroup {
  group: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    group: "Languages",
    skills: ["Python", "JavaScript", "TypeScript"],
  },
  {
    group: "Frameworks & Libraries",
    skills: ["React", "Next.js", "Tailwind CSS", "Pygame", "OpenCV", "PySide6"],
  },
  {
    group: "Tools",
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
  },
  {
    group: "AI / ML",
    skills: ["MediaPipe", "Computer Vision", "Hand Landmark Detection"],
  },
];
