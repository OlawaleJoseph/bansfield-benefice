# Bansfield Benefice website

Astro rebuild of https://www.bansfieldbenefice.org.uk/ using the "Bansfield Benefice website redesign" design.
Every URL from the old site still works.

## Commands

Requires Node 22 (pinned in `.prototools`).

    npm install
    npm run dev       # local dev server at http://localhost:4321 (search works only after a build)
    npm run build     # static site in ./dist, plus the Pagefind search index
    npm run preview   # serve ./dist locally

Deploy by uploading the contents of `dist/` to the web root (the current Apache hosting works as-is),
or connect the repository to Netlify, Cloudflare Pages or similar with build command `npm run build`
and output folder `dist`.

## Updating content

| What | Where |
| --- | --- |
| Monthly service rotas | `src/data/rotas.yaml` |
| Events | `src/data/events.yaml` |
| Church details, photos, maps | `src/data/churches.yaml` |
| Contacts, emails, phone numbers | `src/data/site.ts` |
| Any page carried over from the old site (history, newsletters, notices…) | `src/content/pages/**.html` — HTML with a short YAML header (title, side navigation) |
| Images and documents | `public/` (same paths as the old site) |

The data files are checked when you build: a typo such as a missing date or a bad link fails the build
with a message saying which entry is wrong.

## Structure

- `src/pages/` — the pages from the design (home, services, visit, events, churches, the church page
  template, about, life events, news, contact, safeguarding, policies, search, sitemap), plus two catch-all
  routes that render every migrated page at its original URL.
- `src/components/`, `src/layouts/` — header, footer, page hero, photo frame and other shared pieces.
- `src/styles/site.css` — the design's colours, type and layout.
- `migration/` — a snapshot of the old site and the one-off script (`npm run migrate`) that produced
  `src/content/pages`. Re-running it overwrites any edits made there.
