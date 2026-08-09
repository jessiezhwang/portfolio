import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  label: string;
  className?: string;
}

export default function SkillBadge({ label, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
        "bg-zinc-100 text-zinc-700 border border-zinc-200",
        "dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
        "hover:border-indigo-400 hover:text-indigo-700 dark:hover:border-indigo-500 dark:hover:text-indigo-300",
        "transition-colors duration-150 cursor-default select-none",
        className
      )}
    >
      {label}
    </span>
  );
}
