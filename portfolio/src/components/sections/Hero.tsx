"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

function scrollToProjects() {
  const el = document.querySelector("#projects");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16"
    >
      {/* Subtle background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]"
      />

      <motion.p
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0 }}
        className="text-sm font-medium tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-4"
      >
        Hello, I&apos;m
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4"
      >
        Jessie Wang
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 font-light mb-10 max-w-xl"
      >
        Student Developer
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={scrollToProjects}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium transition-colors duration-200 shadow-sm"
        >
          View My Work
          <ArrowDown size={15} />
        </button>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-5 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
