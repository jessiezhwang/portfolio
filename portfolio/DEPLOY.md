# Deployment Guide

How to get `jessiewang.dev` live on Vercel using Porkbun for your domain.

---

## Step 1 — Push code to GitHub

1. Go to [github.com](https://github.com) and create a new **public** repository named `portfolio`
2. In your terminal, from the `portfolio/` folder:

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/jessiezhwang/portfolio.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with your GitHub account
2. Click **"Add New Project"**
3. Import your `portfolio` repository from GitHub
4. **Important:** Set the **Root Directory** to `portfolio` (click "Edit" next to the root directory field)
   - The repo root contains multiple projects (Minesweeper, HandTrackingMac, portfolio)
   - Vercel needs to know the Next.js app is inside `portfolio/`, not at the root
5. Vercel auto-detects Next.js once the root directory is set — leave all other settings as-is
6. Click **"Deploy"**

Your site will be live at a `*.vercel.app` URL within ~60 seconds. Every future `git push` to `main` will auto-deploy.

---

## Step 3 — Buy `jessiewang.dev` on Porkbun

1. Go to [porkbun.com](https://porkbun.com)
2. Search for `jessiewang.dev`
3. Purchase it (~$10–12/year, free WHOIS privacy included)
4. Create an account if you don't have one

---

## Step 4 — Connect your domain to Vercel

### In Vercel:

1. Open your project dashboard
2. Go to **Settings → Domains**
3. Type `jessiewang.dev` and click **Add**
4. Also add `www.jessiewang.dev` if you want the `www` version to redirect
5. Vercel will show you the DNS records you need to add — they look like:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME record**: `www` → `cname.vercel-dns.com`

### In Porkbun:

1. Log in to [porkbun.com](https://porkbun.com)
2. Go to **Domain Management** → click on `jessiewang.dev`
3. Click **DNS** (in the domain details panel)
4. Delete any existing A or CNAME records for `@` and `www`
5. Add the two records from Vercel:
   - Type: **A** | Host: `@` | Answer: `76.76.21.21` | TTL: 600
   - Type: **CNAME** | Host: `www` | Answer: `cname.vercel-dns.com` | TTL: 600
6. Save

---

## Step 5 — Wait for DNS + SSL

- DNS propagation takes **2–10 minutes** (sometimes up to 48 hours, but usually fast)
- Once Vercel detects the DNS records, it automatically provisions an **SSL certificate** (HTTPS)
- You'll see a green checkmark in Vercel's Domains panel when it's ready
- Visit `https://jessiewang.dev` to confirm

---

## Updating the site

Any time you push to `main` on GitHub, Vercel re-deploys automatically. No manual steps needed.

```bash
git add .
git commit -m "update portfolio"
git push
```

---

## Things to update before going live

Search the codebase for `// TODO:` comments — there are a few placeholders to replace:

| File | What to update |
|------|---------------|
| `src/components/sections/About.tsx` | Your real bio |
| `src/components/sections/Contact.tsx` | Your real email, GitHub URL, LinkedIn URL |
| `src/components/ui/ProjectCard.tsx` | Your real GitHub repo URL for Minesweeper |
| `src/data/projects.ts` | Replace placeholder projects with real ones |
| `src/data/skills.ts` | Fill in your AI/ML tools |
| `src/app/layout.tsx` | `metadataBase` URL is already `jessiewang.dev` — no change needed |
