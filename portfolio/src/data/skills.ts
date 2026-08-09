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
    skills: ["React", "Next.js", "Tailwind CSS", "Pygame"],
  },
  {
    group: "Tools",
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
  },
  {
    group: "AI / ML",
    // TODO: Add your AI/ML tools and frameworks here
    skills: ["— add your tools here —"],
  },
];
