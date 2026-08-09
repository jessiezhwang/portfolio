"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// Inline SVGs for brand icons not in lucide-react
function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const links = [
  {
    label: "Email",
    href: "mailto:hello@jessiewang.dev", // TODO: Replace with your real email
    icon: Mail,
    description: "hello@jessiewang.dev",
    isLucide: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/jessiewang", // TODO: Replace with your real GitHub URL
    SvgIcon: GitHubIcon,
    description: "github.com/jessiewang",
    isLucide: false,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/jessiewang", // TODO: Replace with your real LinkedIn URL
    SvgIcon: LinkedInIcon,
    description: "linkedin.com/in/jessiewang",
    isLucide: false,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 as number },
  visible: { opacity: 1, y: 0 as number },
};

export default function Contact() {
  return (
    <section id="contact" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="text-sm font-medium tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3">
            Contact
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Let&apos;s connect.
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mx-auto">
            Whether it&apos;s a project, an opportunity, or just a hello — my
            inbox is open.
          </p>
        </motion.div>

        {/* Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {links.map((link) => (
            <motion.a
              key={link.label}
              variants={itemVariants}
              href={link.href}
              target={link.label !== "Email" ? "_blank" : undefined}
              rel={link.label !== "Email" ? "noopener noreferrer" : undefined}
              aria-label={link.label}
              className={cn(
                "flex items-center gap-4 w-full sm:w-64 px-6 py-5 rounded-2xl",
                "bg-white dark:bg-zinc-800/60",
                "border border-zinc-200 dark:border-zinc-700",
                "hover:border-indigo-400 dark:hover:border-indigo-500",
                "hover:shadow-md dark:hover:shadow-zinc-900/40",
                "transition-all duration-200 group"
              )}
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                {link.isLucide && link.icon ? (
                  <link.icon size={20} strokeWidth={1.75} />
                ) : link.SvgIcon ? (
                  <link.SvgIcon size={20} />
                ) : null}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {link.label}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  {link.description}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
