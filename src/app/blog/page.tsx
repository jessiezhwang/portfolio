import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Jessie Wang",
  description: "Writing on code, AI, and building things. Coming soon.",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-4">
        Blog
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
        Coming Soon
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-sm mb-10">
        I&apos;m planning to write about code, AI, and the things I build.
        Check back later.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
      >
        ← Back to portfolio
      </Link>
    </main>
  );
}
