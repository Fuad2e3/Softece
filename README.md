# Softece — Software Company Website

A fast, fully responsive multi-page marketing website for **Softece**, a full-stack
software company. Built with plain HTML, CSS and vanilla JavaScript — no build step,
no dependencies, no framework to keep up to date.

**Live site:** enable GitHub Pages on the `main` branch to publish at
`https://fuad2e3.github.io/Softece/`

---

## One page, six routes

The whole site is a single `index.html`. Each section is a `<section class="route">`
and the router in `assets/js/main.js` shows one at a time, so the address never grows
past a hash:

| Address | What's on it |
|---|---|
| `/Softece/` | Hero with animated code card, tech marquee, all 7 services, animated stat counters, "why us" panel, 4-step process, testimonials, CTA |
| `/Softece/#services` | A full detail section per service, plus three pricing tiers |
| `/Softece/#work` | Every public GitHub repository as a card, with a live category filter |
| `/Softece/#about` | Company story, timeline, team, culture stats |
| `/Softece/#contact` | Enquiry form with validation, direct contact details, six-question FAQ accordion |
| `/Softece/#order` | Order form with the package preselected — `#order/growth` picks Growth |

Deep anchors resolve to the section that owns them, so `#pricing`, `#team`, `#process`
and the per-service anchors stay short and keep working. The old `.html` and directory
addresses redirect to their route. With JavaScript off nothing is hidden and the page
reads as one long document.

## Services covered

1. **App Development** — native Android (Kotlin/Compose) and iOS (Swift/SwiftUI)
2. **Cross-Platform Development** — Flutter and React Native from one codebase
3. **Web Development** — Next.js, React, Vue, Laravel; performance and accessibility budgeted
4. **Server Making** — Linux provisioning, Docker, Kubernetes, Terraform, CI/CD
5. **Database Making** — PostgreSQL, MySQL, MongoDB, Redis; indexing, replication, tested backups
6. **API Development** — REST and GraphQL, OAuth2, rate limits, signed webhooks
7. **Load Balancing & Scaling** — NGINX, HAProxy, AWS ELB, Cloudflare, autoscaling

## Forms

**Contact page** — the enquiry form hands the message to the visitor's own mail
client, prefilled. Nothing is sent until they press send there.

**Order page** — `#order` is reached from the Buy buttons on the pricing cards
(`#order/growth` picks Growth). Orders land in a Google Sheet. There is no backend
here, so the form POSTs to a Google Apps Script web app that appends a row:

1. Create a Google Sheet.
2. **Extensions → Apps Script**, paste the Apps Script web app code.
3. **Deploy → New deployment → Web app**, with *Execute as: Me* and
   *Who has access: Anyone*. Authorise, then copy the `/exec` URL.
4. Put that URL in the repository secret **`SHEET_ENDPOINT`**
   (Settings → Secrets and variables → Actions → New repository secret), and set
   Settings → Pages → Source to **GitHub Actions**.

The raw endpoint URL is kept private. The client-side form safely connects
to the web app and appends rows directly to the dashboard.

Columns: `Received`, `Package`, `Price`, `Name`, `Email`, `Phone`, `Company`, `Start`, `Details`, `Status`, `Payment Method`, `Payment Status`, `TrxID / Note`.

Payments workflow: Clients choose between *Pay after Discussion* (free consultation, advance after scope lock), *bKash (Send Money)*, *Nagad (Send Money)*, *Rocket (Send Money)*, or *Bank Transfer*. Upon submission, a post-order payment receipt card provides 1-click bKash/Nagad/Rocket number copying (`01902780443`), instant WhatsApp confirmation with pre-filled order details, and late TrxID logging directly to the sheet.

Until `data-sheet` is filled in — and if the request ever fails — the order falls back
to the mail client too, so a filled-in form is never lost.

## Features

- **Automatic day / night** — follows the operating system out of the box and keeps following
  it if the OS flips at sunset. The theme button cycles auto → light → dark; a forced choice is
  remembered and applied before first paint, so the page never flashes the wrong palette
- **Easy on the eyes** — the night palette avoids pure black behind near-white text and the day
  palette avoids a full-brightness white page, the two pairings that cause the most glare.
  Every text colour on every page clears WCAG AA in both palettes
- **Fully responsive** — verified from 320px to 2560px with no horizontal scrolling, no text
  under 12px and no undersized tap targets, with a full-screen mobile menu. Below 640px the
  vertical rhythm tightens, work-card covers become a strip rather than half the card, and
  the portfolio filters scroll sideways instead of stacking three rows deep
- **Fast** — five same-origin requests per page and no third parties at all: the two variable
  fonts are self-hosted (`assets/fonts/`, latin subset, ~70KB combined and cached across the
  whole site), so a visit costs no extra DNS lookup, TLS handshake or round trip before text
  can be styled, and the site still gets its typeface where Google Fonts is slow or blocked.
  Gzipped, a page is ~6–8KB of HTML plus 10KB of CSS and 4.5KB of JS. 60fps scrolling:
  background glows are painted as gradients and animations stick to compositor-only properties
- **Scroll-reveal animations** via `IntersectionObserver`, with staggered delays
- **Animated counters** that run once when scrolled into view
- **Cursor-tracking glow** on service cards
- **Portfolio filtering**, **FAQ accordion**, **scroll progress bar** and **back-to-top** button
- **Accessible** — semantic landmarks, ARIA labels, a visible focus ring on every control,
  keyboard-operable menu (Esc closes)
- **Works without JavaScript** — the page renders complete with scripting off or failed;
  reveals and counter animations are enhancements layered on top, never a prerequisite
- **`prefers-reduced-motion`** respected — all motion dropped and every section shown up
  front, rather than gated behind a scroll reveal
- **Prints properly** — a white, ink-friendly page with decorative layers removed and link
  destinations spelled out
- **SEO ready** — per-page titles, meta descriptions, Open Graph tags, `sitemap.xml`, `robots.txt`
