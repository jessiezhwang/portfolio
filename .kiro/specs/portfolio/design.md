# Portfolio Website — Design

## Project Structure

```
/Users/jessiewang/Work/Portfolios/
├── Minesweeper/               ← existing project (source only)
└── portfolio/                 ← new Next.js project (scaffold here)
    ├── public/
    │   ├── minesweeper/       ← copied from Minesweeper/build/web/
    │   │   ├── index.html
    │   │   ├── minesweeper.apk
    │   │   ├── minesweeper.tar.gz
    │   │   └── favicon.png
    │   └── favicon.ico
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         ← root layout, ThemeProvider, metadata
    │   │   ├── page.tsx           ← home page (all sections)
    │   │   ├── globals.css        ← Tailwind base styles
    │   │   └── blog/
    │   │       └── page.tsx       ← "Coming Soon" stub
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.tsx     ← sticky nav, dark mode toggle, smooth scroll
    │   │   │   └── Footer.tsx     ← minimal footer with copyright
    │   │   ├── sections/
    │   │   │   ├── Hero.tsx
    │   │   │   ├── About.tsx
    │   │   │   ├── Projects.tsx
    │   │   │   ├── Skills.tsx
    │   │   │   └── Contact.tsx
    │   │   └── ui/
    │   │       ├── ProjectCard.tsx    ← reusable project card
    │   │       ├── SkillBadge.tsx     ← skill pill/badge
    │   │       ├── ThemeToggle.tsx    ← sun/moon icon button
    │   │       └── MinesweeperEmbed.tsx ← iframe wrapper for the game
    │   ├── data/
    │   │   ├── projects.ts        ← project data array
    │   │   └── skills.ts          ← skills data array
    │   └── lib/
    │       └── utils.ts           ← cn() helper (clsx + tailwind-merge)
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Component Design

### `app/layout.tsx`
- Wraps the app in a `ThemeProvider` context (manages dark/light state, persists to localStorage)
- Sets root `<html>` class to `dark` or `light` based on theme
- Metadata: title "Jessie Wang — Portfolio", description, Open Graph

### `app/page.tsx`
- Renders all sections in order: `<Hero>`, `<About>`, `<Projects>`, `<Skills>`, `<Contact>`
- Each section has an `id` attribute matching nav link anchors (`#about`, `#projects`, etc.)

### `Navbar.tsx`
- `position: sticky`, `top: 0`, `z-50`
- On scroll > 10px: adds `backdrop-blur-md` + subtle bottom border (Framer Motion `animate`)
- Left: "JW" text logo (links to `#hero`)
- Right: nav links + `<ThemeToggle>`
- Nav links use `onClick` with `scrollIntoView({ behavior: 'smooth' })`

### `Hero.tsx`
- Full viewport height (`min-h-screen`)
- Centered content (flexbox column)
- Framer Motion: `initial={{ opacity: 0, y: 30 }}` → `animate={{ opacity: 1, y: 0 }}`, staggered for name, tagline, and button
- "View My Work" button scrolls to `#projects`

### `About.tsx`
- Two-column desktop layout: left = text, right = avatar placeholder (gray circle or initials block)
- Framer Motion `whileInView` fade-in

### `Projects.tsx`
- Section heading + subheading
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Maps over `projects.ts` data array → renders `<ProjectCard>` for each
- Minesweeper card includes a "Play in Browser" button that reveals `<MinesweeperEmbed>`

### `ProjectCard.tsx`
Props:
```ts
interface Project {
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  isPlayable?: boolean       // shows "Play" button if true
  thumbnailColor?: string    // placeholder color for thumbnail area
}
```
- Framer Motion `whileHover={{ scale: 1.02 }}` + shadow transition
- Thumbnail area: colored block (no image needed for placeholder projects)
- Tech stack: row of `<SkillBadge>` components

### `MinesweeperEmbed.tsx`
- Conditionally rendered (hidden by default, shown when "Play in Browser" clicked)
- `<iframe src="/minesweeper/index.html" width={480} height={520} />`
- Wrapped in a modal or inline expand below the card
- Note: width 480 = 15 cols × 32px, height 520 gives a little padding above the canvas

### `Skills.tsx`
- Four groups: Languages, Frameworks, Tools, AI/ML
- Each group has a heading + row of `<SkillBadge>` pills
- `whileInView` animation, staggered children

### `SkillBadge.tsx`
Props: `{ label: string, icon?: string }`
- Rounded pill, border, small text
- Slight hover background change

### `Contact.tsx`
- Centered layout
- Three icon links: Email (`mailto:`), GitHub, LinkedIn
- Each link is a large icon + label, opens in new tab

### `ThemeToggle.tsx`
- Reads from `ThemeContext`
- Renders sun icon (light mode) or moon icon (dark mode)
- Toggles theme and persists to `localStorage`

### `Footer.tsx`
- One line: "© 2025 Jessie Wang. Built with Next.js & Tailwind CSS."

---

## Theme System

```ts
// Context stores: 'light' | 'dark'
// On mount: reads localStorage 'theme', falls back to 'light'
// On toggle: updates state + localStorage + flips html class
```

Tailwind config:
```ts
darkMode: 'class'  // enables dark: variant
```

---

## Data Files

### `data/projects.ts`
```ts
export const projects = [
  {
    title: "Minesweeper",
    description: "A classic Minesweeper game built with Python and Pygame, compiled to WebAssembly with Pygbag so it runs directly in the browser.",
    techStack: ["Python", "Pygame", "Pygbag", "WebAssembly"],
    githubUrl: "https://github.com/jessiewang",  // placeholder
    isPlayable: true,
    thumbnailColor: "#4f46e5",
  },
  {
    title: "Project Placeholder 1",
    description: "Description of a future project. Replace with your real project details.",
    techStack: ["Python", "React"],
    githubUrl: "#",
    thumbnailColor: "#0891b2",
  },
  {
    title: "Project Placeholder 2",
    description: "Description of a future project. Replace with your real project details.",
    techStack: ["TypeScript", "Next.js"],
    githubUrl: "#",
    thumbnailColor: "#059669",
  },
]
```

### `data/skills.ts`
```ts
export const skillGroups = [
  { group: "Languages",             skills: ["Python", "JavaScript", "TypeScript"] },
  { group: "Frameworks & Libraries", skills: ["React", "Next.js", "Tailwind CSS", "Pygame"] },
  { group: "Tools",                 skills: ["Git", "GitHub", "VS Code", "Vercel"] },
  { group: "AI / ML",               skills: ["— add your tools here —"] },
]
```

---

## Styling Approach

- **Base font**: `Inter` via `next/font/google`
- **Accent color**: Indigo (`indigo-600` light / `indigo-400` dark)
- **Background**: `white` light / `zinc-900` dark
- **Text**: `zinc-800` light / `zinc-100` dark
- **Cards**: `white` / `zinc-800`, `border border-zinc-200` / `border-zinc-700`
- **Section padding**: `py-24 px-6 max-w-6xl mx-auto`

---

## Minesweeper Embed — Build Note

The pygbag output at `Minesweeper/build/web/` needs to be copied to `portfolio/public/minesweeper/` before the first build. This will be handled as part of the scaffold task. The game canvas is 480×480px (15 rows × 15 cols × 32px/tile).

---

## Deployment Plan

1. Create GitHub repo: `jessiewang/portfolio`
2. Push `portfolio/` folder to `main` branch
3. Connect repo to Vercel (Import Project)
4. Vercel auto-detects Next.js, no config needed
5. Buy `jessiewang.dev` on Porkbun (~$10/yr, free WHOIS privacy included)
6. In Vercel dashboard → Project → Settings → Domains → add `jessiewang.dev`
7. Vercel shows you two DNS records to add:
   - `A` record: `@` → `76.76.21.21`
   - `CNAME` record: `www` → `cname.vercel-dns.com`
8. In Porkbun dashboard → Domain → DNS → add those two records
9. Vercel provisions SSL automatically (~2–5 min after DNS propagates)
10. Visit `https://jessiewang.dev` to confirm

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Single page vs multi-page | Single page (sections) | Better for portfolio UX, fast to navigate |
| Blog in v1 | Stub only | Avoids scope creep, easy to add MDX later |
| Contact form | Links only | No backend needed, lower complexity |
| Game embed | iframe + pygbag wasm | Game already compiled, simplest integration |
| Mobile | Desktop-first, basic mobile compat | Primary audience is on computers |
| Dark mode | Light default + toggle | Best first impression, shows technical care |
| Domain registrar | Porkbun | Cheapest at-cost .dev pricing, free WHOIS privacy, clean DNS UI |
| Domain name | jessiewang.dev | Professional, dev-specific TLD, memorable |
