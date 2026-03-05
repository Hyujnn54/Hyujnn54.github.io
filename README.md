# Hyujnn Portfolio

Personal developer portfolio for **Hyujnn54** — built with vanilla HTML, CSS, and JavaScript. Hosted on GitHub Pages.

## 🚀 Deploy to GitHub Pages (Free)

### Option A — Rename the repo to your GitHub Pages domain

1. Go to **GitHub → Settings → Rename** the repo to `Hyujnn54.github.io`
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at: `https://hyujnn54.github.io`

### Option B — Use this repo as-is

1. Go to **Settings → Pages**
2. Source: **Deploy from a branch** → `main` → `/ (root)`
3. Your site will be live at: `https://hyujnn54.github.io/hyujnn_portfolio`

---

## 🌐 Free Custom Domain Options

| Option | Domain format | How to get it | Cost |
|--------|--------------|---------------|------|
| **GitHub Pages default** | `hyujnn54.github.io` | Automatic with GitHub Pages | Free forever |
| **is-a.dev** | `hyujnn54.is-a.dev` | Submit a PR to [is-a-dev/register](https://github.com/is-a-dev/register) | Free |
| **js.org** | `hyujnn.js.org` | Submit a PR to [js-org/js.org](https://github.com/js-org/js.org) | Free |
| **Cloudflare Pages** | `hyujnn-portfolio.pages.dev` | Connect GitHub repo at dash.cloudflare.com | Free |
| **Netlify** | `hyujnn-portfolio.netlify.app` | Connect GitHub repo on netlify.com | Free |
| **Vercel** | `hyujnn-portfolio.vercel.app` | Connect GitHub repo on vercel.com | Free |
| **.com / .dev domain** | `hyujnn.dev` | Buy from Namecheap / Porkbun | ~$10–15/yr |

> **Best free custom subdomain**: `is-a.dev` — requires just opening a PR with a JSON file in their repo. Your site becomes `hyujnn54.is-a.dev` pointing to your GitHub Pages.  
> **Best free hosting alternative**: Cloudflare Pages or Vercel — both have even faster CDN than GitHub Pages and support custom domains for free.

---

## 🔗 Pointing a Custom Domain to GitHub Pages

Once you have a domain (or subdomain), in your repo:

1. Create a file called **`CNAME`** in the root with your domain inside:
   ```
   yourdomain.com
   ```
2. In your domain registrar's DNS, add:
   - For **apex domain** (`yourdomain.com`): 4 A records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - For **subdomain** (`www.yourdomain.com`): A CNAME record pointing to `hyujnn54.github.io`

---

## 📁 Project Structure

```
hyujnn_portfolio/
├── index.html       # Main portfolio page
├── css/
│   └── style.css    # All styles (dark Tokyo Night theme)
├── js/
│   └── main.js      # Particle canvas, typing animation, GitHub API, animations
└── README.md
```

## ✨ Features

- **Animated particle canvas** background with connected stars
- **Typewriter** animation cycling through roles
- **Live GitHub API** — repo cards fetched in real time with language colors, stars, forks
- **Filter repos** by language
- **GitHub stats cards** — stats, top languages, streak, activity graph
- **Animated snake contribution** graph
- **GitHub trophies** banner
- **Badge grid** for tech stack
- **Reveal on scroll** animations for every section
- **Mobile responsive** with hamburger menu
- **Dark Tokyo Night** color theme
