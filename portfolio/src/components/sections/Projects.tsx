"use client";

import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import ProjectCard from "@/components/ui/ProjectCard";

export default function Projects() {
  return (
    <section id="projects" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3">
            Projects
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Things I&apos;ve built.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl">
            A mix of real projects and placeholders — the Minesweeper game is
            fully playable in your browser.
          </p>
        </motion.div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
