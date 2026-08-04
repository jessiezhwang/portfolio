# Portfolio Website — Requirements

## Overview

A personal coding portfolio website for Jessie Wang, a student developer and AI enthusiast. The site will be publicly accessible via a custom domain (purchased through Porkbun), deployed on Vercel, and designed to make a strong impression on academic programs (e.g. NCSSM) and future employers.

---

## Goals

- Present Jessie's identity, skills, and projects in a clean, professional format
- Embed the Minesweeper Python/Pygame game (already built and pygbag-compiled) so visitors can play it in-browser
- Be visually minimal and modern, desktop-first
- Support light mode by default with a dark mode toggle
- Be easy to update as new projects are added over time

---

## Requirements

### REQ-1: Site Structure

The site is a single-page application with the following sections, navigable via a sticky top navigation bar:

1. **Hero** — Name, tagline, and a subtle entrance animation
2. **About** — Short bio paragraph with interests in CS/AI
3. **Projects** — Project cards with description, tech stack, GitHub link, and live link (where applicable)
4. **Skills** — Grouped display of languages, frameworks, tools, and AI/ML experience
5. **Contact** — Email, GitHub, and LinkedIn links

A **Blog** route (`/blog`) will be stubbed (page exists, shows "Coming Soon") but not fully built in v1.

### REQ-2: Hero Section

- Display full name: **Jessie Wang**
- Tagline: **"Student Developer / AI Enthusiast"**
- Subtle entrance animation using Framer Motion (fade-in + slight upward slide)
- CTA button: "View My Work" that smooth-scrolls to the Projects section

### REQ-3: About Section

- Placeholder bio text (to be replaced by Jessie)
- Mentions interest in computer science, AI/ML, and building real projects
- Clean two-column layout on desktop (text + optional image/avatar placeholder)

### REQ-4: Projects Section

The projects section is the most important section of the site.

**REQ-4a: Minesweeper Project (real, embedded)**
- Project card for the Minesweeper game built with Python/Pygame
- Clicking a "Play" button or "Live Demo" opens an embedded view of the game
- The game runs via WebAssembly (pygbag build output) inside an `<iframe>`
- The pygbag build output (`build/web/`) from `/Users/jessiewang/Work/Portfolios/Minesweeper/build/web/` will be copied into the Next.js `public/minesweeper/` folder
- The game canvas is 480×480px (15 tiles × 32px each), centered in the embed view
- Tech stack badge: Python, Pygame, Pygbag, WebAssembly

**REQ-4b: Placeholder Projects**
- 2 additional placeholder project cards to fill the grid
- Clearly marked as placeholder so Jessie knows to replace them
- Each card has: title, description, tech stack badges, GitHub link (disabled/placeholder), live link (optional)

**REQ-4c: Project Card Design**
- Cards in a responsive grid: 1 column on mobile, 2–3 columns on desktop
- Each card: project image/thumbnail area (placeholder color block), title, short description, tech stack tags, action links

### REQ-5: Skills Section

Grouped skill display:

- **Languages**: Python, JavaScript, TypeScript
- **Frameworks & Libraries**: React, Next.js, Tailwind CSS, Pygame
- **Tools**: Git, GitHub, VS Code, Vercel
- **AI / ML**: Placeholder (to be filled in by Jessie)

Display as icon + label pill components in a grouped layout.

### REQ-6: Contact Section

- Email link (placeholder: `hello@jessiewang.dev` — to be updated)
- GitHub link (placeholder URL — to be updated)
- LinkedIn link (placeholder — to be updated)
- Simple layout, no contact form needed in v1

### REQ-7: Navigation

- Sticky top navigation bar
- Logo/name on the left: "Jessie Wang" or initials "JW"
- Nav links on the right: About, Projects, Skills, Contact, Blog
- Dark mode toggle button in the nav bar (sun/moon icon)
- Smooth scroll behavior on nav link click

### REQ-8: Theme

- **Default**: Light mode
- **Toggle**: Dark mode, persisted to `localStorage` so preference is remembered on revisit
- Tailwind `dark:` variant used throughout
- Color palette: neutral grays, white background, a single accent color (to be chosen — default: indigo/blue)

### REQ-9: Animations

- Hero section entrance: fade-in + translateY using Framer Motion
- Project cards: subtle hover lift effect (scale + shadow)
- Section transitions: fade-in when scrolled into view (Framer Motion `whileInView`)
- Nav bar: subtle backdrop blur + border on scroll

### REQ-10: Performance & SEO

- Next.js metadata API used for `<title>`, `<meta description>`, Open Graph tags
- All images use Next.js `<Image>` component
- Favicon set
- Lighthouse score target: 90+ on Performance, Accessibility, SEO

### REQ-11: Deployment

- Hosted on **Vercel** (Hobby / free tier)
- Domain purchased via **Porkbun**, pointed at Vercel via DNS A/CNAME records
- Auto-deploy on push to `main` branch via GitHub integration
- HTTPS enforced automatically by Vercel

### REQ-12: Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Game embed | pygbag WebAssembly (iframe) |
| Blog (stub) | MDX-ready route, not built in v1 |
| Deployment | Vercel |
| Domain | Porkbun |

---

## Out of Scope (v1)

- Blog content (route stubbed only)
- Contact form with backend/email sending
- Analytics
- CMS integration
- Mobile-only features (site is desktop-first; basic mobile compatibility is a nice-to-have)
