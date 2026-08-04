# Portfolio Website — Tasks

## Task List

### Phase 1 — Scaffold ✅

- [x] **T1**: Scaffold Next.js 14 project with TypeScript, Tailwind CSS, and App Router at `/Users/jessiewang/Work/Portfolios/portfolio`
- [x] **T2**: Install dependencies: `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`
- [x] **T3**: Configure `tailwind.config.ts` — enable `darkMode: 'class'`, set font, define color palette
- [x] **T4**: Set up `src/lib/utils.ts` with `cn()` helper
- [x] **T5**: Copy Minesweeper pygbag build output (`Minesweeper/build/web/*`) into `portfolio/public/minesweeper/`

### Phase 2 — Core Layout ✅

- [x] **T6**: Create `ThemeProvider` context (`src/app/providers.tsx`) with localStorage persistence
- [x] **T7**: Update `app/layout.tsx` — Inter font, ThemeProvider, metadata (title, description, OG tags), favicon
- [x] **T8**: Build `Navbar.tsx` — sticky, scroll-aware blur, JW logo, nav links, ThemeToggle
- [x] **T9**: Build `ThemeToggle.tsx` — sun/moon icon button wired to ThemeContext
- [x] **T10**: Build `Footer.tsx` — copyright line

### Phase 3 — Sections ✅

- [x] **T11**: Build `Hero.tsx` — name, tagline, CTA button, Framer Motion entrance animation
- [x] **T12**: Build `About.tsx` — placeholder bio, two-column layout, whileInView animation
- [x] **T13**: Build `SkillBadge.tsx` and `data/skills.ts`
- [x] **T14**: Build `Skills.tsx` — four groups, staggered whileInView animation
- [x] **T15**: Build `ProjectCard.tsx` — thumbnail, title, description, tech badges, links, hover animation
- [x] **T16**: Build `MinesweeperEmbed.tsx` — iframe wrapper, show/hide toggle
- [x] **T17**: Build `Projects.tsx` — grid layout, maps over `data/projects.ts`, wires up MinesweeperEmbed
- [x] **T18**: Build `Contact.tsx` — email, GitHub, LinkedIn icon links
- [x] **T19**: Assemble `app/page.tsx` — all sections in order with correct `id` attributes

### Phase 4 — Blog Stub ✅

- [x] **T20**: Create `app/blog/page.tsx` — "Coming Soon" page, consistent styling

### Phase 5 — Polish & Verification ✅

- [x] **T21**: Verify dark mode toggle works correctly in all sections
- [x] **T22**: Verify Minesweeper iframe loads at `/minesweeper/index.html`
- [x] **T23**: Verify smooth scroll navigation for all nav links
- [x] **T24**: Run `npm run build` — confirmed zero errors and zero TypeScript errors
- [x] **T25**: Check basic mobile layout (responsive grid classes in place)

### Phase 6 — Deployment Guide ✅

- [x] **T26**: Write `DEPLOY.md` — step-by-step instructions for GitHub → Vercel → Porkbun DNS setup

---

## Your Remaining To-Dos

These are not code tasks — they're content and account setup steps only you can do.

### Content (update placeholder text in the codebase)

Search for `// TODO:` in the project — every placeholder is marked. Specifically:

- [ ] **C1**: Replace bio in `src/components/sections/About.tsx` with your real bio (3 paragraphs, with a personal detail)
- [ ] **C2**: Replace email in `src/components/sections/Contact.tsx` → your real email
- [ ] **C3**: Replace GitHub URL in `src/components/sections/Contact.tsx` → your real GitHub profile link
- [ ] **C4**: Replace LinkedIn URL in `src/components/sections/Contact.tsx` → your real LinkedIn (or remove the card if you don't have one yet)
- [ ] **C5**: Replace GitHub URL in `src/data/projects.ts` for the Minesweeper project → your real repo link
- [ ] **C6**: Replace the 2 placeholder project cards in `src/data/projects.ts` with real projects as you build them
- [ ] **C7**: Fill in the AI/ML skills group in `src/data/skills.ts`
- [ ] **C8**: (Optional) Add a real photo — replace the `JW` initials block in `About.tsx` with a `<Image>` component

### Accounts & Deployment

- [ ] **D1**: Create a GitHub account (if you don't have one) and push the portfolio repo
- [ ] **D2**: Create a Vercel account at [vercel.com](https://vercel.com) and import the GitHub repo
- [ ] **D3**: Buy `jessiewang.dev` on [porkbun.com](https://porkbun.com)
- [ ] **D4**: Add the domain in Vercel and configure DNS records in Porkbun (see `DEPLOY.md` for exact steps)
- [ ] **D5**: Confirm `https://jessiewang.dev` loads with green SSL lock

---

## Notes

- Run `npm run dev` inside `portfolio/` to preview locally at `http://localhost:3000`
- Every `git push` to `main` after Vercel is connected will auto-deploy
- Blog is stubbed at `/blog` — MDX content can be added later without restructuring anything
