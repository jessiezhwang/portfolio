"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";
import { type Project } from "@/data/projects";
import SkillBadge from "./SkillBadge";
import MinesweeperEmbed from "./MinesweeperEmbed";
import { cn } from "@/lib/utils";

function GitHubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showGame, setShowGame] = useState(false);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col rounded-2xl overflow-hidden",
        "bg-white dark:bg-zinc-800/60",
        "border border-zinc-200 dark:border-zinc-700",
        "shadow-sm hover:shadow-md dark:hover:shadow-zinc-900/40",
        "transition-shadow duration-200"
      )}
    >
      {/* Thumbnail */}
      <div
        className="h-40 flex items-center justify-center"
        style={{ backgroundColor: project.thumbnailColor }}
      >
        <span
          className="text-2xl font-bold tracking-tight select-none"
          style={{ color: project.thumbnailTextColor ?? "#ffffff" }}
        >
          {project.title}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <SkillBadge key={tech} label={tech} className="text-xs px-2 py-1" />
          ))}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 pt-1">
          {project.isPlayable && (
            <button
              onClick={() => setShowGame((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-colors duration-150"
            >
              <Play size={13} />
              {showGame ? "Hide Game" : "Play in Browser"}
            </button>
          )}
          {project.githubUrl && project.githubUrl !== "#" && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} on GitHub`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-150"
            >
              <GitHubIcon size={15} />
              GitHub
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${project.title} live`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors duration-150"
            >
              <ExternalLink size={15} />
              Live
            </a>
          )}
        </div>
      </div>

      {/* Minesweeper embed — expands below card content */}
      {project.isPlayable && showGame && (
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <MinesweeperEmbed />
        </div>
      )}
    </motion.article>
  );
}
