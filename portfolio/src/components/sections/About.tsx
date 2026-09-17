"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Text */}
          <div>
            <p className="text-sm font-medium tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3">
              About Me
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 leading-tight">
              Turning curiosity into code.
            </h2>
            <div className="space-y-4 text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              {/* TODO: Replace with your real bio */}
              <p>
                I&apos;m Jessie Wang, a high school student who&apos;s passionate about
                programming. I love creating projects that challenge me to learn more, whether its a building games or designing other interactive experiences.
              </p>
              <p>
                My interest in programming started with learning{" "}
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  Python
                </span>
                , and has grown into a curiosity about machine learning, AI
                systems, and how software shapes the world around us.
              </p>
              <p>
                When I&apos;m not coding, I&apos;m sailing a 420 boat, stargazing, or learning
                Astronomy! In my next project, I plan to incorporate both of my interests: Astronomy and Programming.{" "}
                {/* TODO: Add a personal detail here — a hobby, a goal, etc. */}
              </p>
            </div>
          </div>

          {/* Avatar placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative offset square */}
              <div className="absolute -top-3 -left-3 w-full h-full rounded-2xl border-2 border-indigo-200 dark:border-indigo-900" />
              {/* Avatar block */}
              <div className="relative w-64 h-64 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center shadow-md">
                {/* TODO: Replace with <Image> once you have a photo */}
                <span className="text-6xl font-bold text-indigo-300 dark:text-indigo-600 select-none">
                  JW
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
