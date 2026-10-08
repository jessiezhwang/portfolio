import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  label: string;
  className?: string;
  hoverColor?: string;
  hoverColorDark?: string;
}

export default function SkillBadge({
  label,
  className,
  hoverColor,
  hoverColorDark,
}: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
        "bg-zinc-100 text-zinc-700",
        "dark:bg-zinc-800 dark:text-zinc-300",
        hoverColor
          ? [
              "border border-[var(--badge-hover)]/35 dark:border-[var(--badge-hover-dark)]/35",
              "hover:bg-[var(--badge-hover)]/10 hover:border-[var(--badge-hover)] hover:text-[var(--badge-hover)]",
              "dark:hover:bg-[var(--badge-hover-dark)]/10 dark:hover:border-[var(--badge-hover-dark)] dark:hover:text-[var(--badge-hover-dark)]",
            ]
          : "border border-zinc-200 dark:border-zinc-700 hover:border-accent-400 hover:text-accent-700 dark:hover:border-accent-500 dark:hover:text-accent-300",
        "transition-colors duration-150 cursor-default select-none",
        className
      )}
      style={
        hoverColor
          ? ({
              "--badge-hover": hoverColor,
              "--badge-hover-dark": hoverColorDark ?? hoverColor,
            } as CSSProperties)
          : undefined
      }
    >
      {label}
    </span>
  );
}
