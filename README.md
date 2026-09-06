# Softece — Software Company Website

A fast, fully responsive multi-page marketing website for **Softece**, a full-stack
software company. Built with plain HTML, CSS and vanilla JavaScript — no build step,
no dependencies, no framework to keep up to date.

**Live site:** enable GitHub Pages on the `main` branch to publish at
`https://fuad2e3.github.io/Softece/`

---

## Pages

| Page | What's on it |
|---|---|
| `index.html` | Hero with animated code card, tech marquee, all 7 services, animated stat counters, "why us" panel, 4-step process, testimonials, CTA |
| `services.html` | A full detail section per service, plus three pricing tiers |
| `portfolio.html` | Six case studies with a live category filter and result stats |
| `about.html` | Company story, timeline, values, team, culture stats |
| `contact.html` | Enquiry form with validation, direct contact details, six-question FAQ accordion |

## Services covered

1. **App Development** — native Android (Kotlin/Compose) and iOS (Swift/SwiftUI)
2. **Cross-Platform Development** — Flutter and React Native from one codebase
3. **Web Development** — Next.js, React, Vue, Laravel; performance and accessibility budgeted
4. **Server Making** — Linux provisioning, Docker, Kubernetes, Terraform, CI/CD
5. **Database Making** — PostgreSQL, MySQL, MongoDB, Redis; indexing, replication, tested backups
6. **API Development** — REST and GraphQL, OAuth2, rate limits, signed webhooks
7. **Load Balancing & Scaling** — NGINX, HAProxy, AWS ELB, Cloudflare, autoscaling

## Features

- **Dark and light themes** — one-click toggle, remembered in `localStorage`
- **Fully responsive** — single-column mobile through wide desktop, with a full-screen mobile menu
- **Scroll-reveal animations** via `IntersectionObserver`, with staggered delays
- **Animated counters** that run once when scrolled into view
- **Cursor-tracking glow** on service cards
- **Portfolio filtering**, **FAQ accordion**, **scroll progress bar** and **back-to-top** button
- **Accessible** — semantic landmarks, ARIA labels, keyboard-operable menu (Esc closes), visible focus
- **`prefers-reduced-motion`** respected — all animation disabled for users who ask for it
- **SEO ready** — per-page titles, meta descriptions, Open Graph tags, `sitemap.xml`, `robots.txt`
