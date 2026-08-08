# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Home cooks who collect recipes faster than they cook them — people who find food on Instagram Reels, YouTube, TikTok, and recipe blogs, and lose it in bookmarks, screenshots, and saved posts.

RecipeBox is positioned as a public product aiming to grow, competing with Paprika, Mela, Pestle, and Cookpad — not a private tool for a closed circle. Acquisition, activation, and retention are real design concerns.

Usage is overwhelmingly **phone**. Three confirmed scenes:

1. **Saving mid-scroll** — the user is inside Instagram/YouTube, hits share or copies a link, and RecipeBox captures it. The transaction must survive being an interruption to something else.
2. **Cooking in the kitchen** — recipe open on a counter, hands busy or dirty, read at arm's length.
3. **Browsing other people's saves** — feed, profiles, following. Social discovery rather than personal storage.

Desktop use was not confirmed as a primary scene. Design for phone first; desktop must work, but it is not where decisions get made.

## Product Purpose

Capture any recipe from any source with one paste or share, then find it again when it's time to cook. RecipeBox pulls the title, thumbnail, cook time, and servings automatically — the user never types a recipe in.

Success is a user whose whole recipe life lives here: they save without thinking about it, they can find a specific dish months later, and they see what people they follow are cooking.

## Positioning

**Open decision — do not commit design work to a positioning claim yet.**

PLAN.md (2026-04-21) asserts the edge is "social graph + AI extraction," and the code supports both. The user has not confirmed that as durable positioning. Two live candidates:

- The social graph — following real people and seeing their saves — is the moat; AI extraction is the enabler.
- Zero-friction capture — Reel, video, or blog, saved in one action with no manual entry — is the claim; social is additive.

Until this is settled, surfaces may describe what the product truthfully does. They may not build a headline, hero, or narrative on a hierarchy between these two that has not been chosen.

## Operating Context

- Installed as a PWA with an OS-level **share target** (`app/manifest.ts`) — the share sheet is a primary entry point, not a nicety.
- **Clipboard detection**: when the app regains focus, a URL on the clipboard surfaces a save banner with a live preview (`app/page.tsx`).
- Source platforms carry their own visual identity and constraints — Instagram, YouTube, and generic recipe sites are each detected and badged (`components/SourceBadge.tsx`).
- Recipes are links plus metadata, not full recipe text. The user leaves for the source site to actually cook from it.
- Sharing between users happens by link: a recipe gets a share token, the recipient opens `/share/[token]` and saves it into their own collection with attribution.

## Capabilities and Constraints

**Shipped**

- Save from any URL; automatic extraction of title, thumbnail, cook time, servings.
- Extraction paths: YouTube (video ID → title + thumbnail), Instagram (og scrape → Claude Haiku parses the caption into title/cook time/servings), generic Open Graph scrape via Cheerio.
- Free-form tags, notes, search, filtering, and grid/list views.
- Accounts via Clerk (Google OAuth). Public usernames (3–20 chars, `[a-z0-9_]`, reserved list in `lib/username.ts`), display names, avatars with crop.
- Social graph: follow/unfollow, user directory, per-user profile pages, a feed of recipes from people you follow, and follow notifications.
- Share tokens per recipe; recipient saves with attribution back to the sharer.

**Technical constraints**

- Next.js 16 App Router + React 19, CSS Modules (no utility framework), `lucide-react` icons, Clerk auth, Supabase Postgres. Deployed on Vercel.
- **This Next.js version has breaking changes from common knowledge** — `AGENTS.md` requires reading `node_modules/next/dist/docs/` before writing code.
- Instagram thumbnails must be proxied through `/api/ig-thumb/[shortcode]`: CORP headers block every variant except `og:image`, which expires in roughly four days. A refresh route exists (`/api/recipes/refresh-instagram-thumbnails`).
- Some sites block scraping; extraction degrades to a fallback title with no thumbnail. Empty and degraded thumbnails are a normal state, not an edge case.
- The main recipe list loads everything at once — pagination is a known open TODO (`app/page.tsx`).
- Server-side API routes use the Supabase service role key; RLS denies all anon access. Authorization is enforced in route handlers via Clerk.

**Not built**

Collections/cookbooks, comments/reactions, an explore or trending feed, a "made it" cooking log, ingredient parsing or shopping lists, TikTok import, meal planning. These are roadmap items in `PLAN.md`, not product truth.

## Brand Commitments

- Name: **RecipeBox**. The wordmark is set as italic `Recipe` + bold `Box` (`components/AppHeader.tsx`).
- Existing typography: Playfair Display (serif, headings) + DM Sans (sans, body). Playfair Display ExtraBold/ExtraBoldItalic TTFs ship in `assets/` for OG image rendering.
- Existing palette in `app/globals.css`: warm cream ground `#FAF7EF`, deep green `#234b39`, yellow accent `#F5C73A`, terracotta `#C86C44`.
- These are the incumbent implementation, recorded as fact. They are not declared binding — a redesign may replace them.

## Evidence on Hand

- Real product surfaces and copy: landing page in `app/page.tsx`, OG images at `app/opengraph-image.tsx` and `app/share/[token]/opengraph-image.tsx`.
- Icons and PWA assets in `public/`.
- Competitive landscape table in `PLAN.md` (Paprika, Mela/Pestle, Plan to Eat, Cookpad, Samsung Food; Yummly shut down Dec 2024).
- **No confirmed user counts, growth metrics, testimonials, press, ratings, or case studies exist.** No surface may invent them. The only claim currently made in product copy is "Free to use."

## Product Principles

1. **Capture is an interruption — respect that.** The user is mid-scroll in another app. Saving must complete in one action and get out of the way.
2. **Never make anyone type a recipe.** Automatic extraction is the product. Manual entry is a repair path, not a flow.
3. **A phone at arm's length is the design target.** Kitchen legibility and thumb reach outrank density.
4. **Degraded metadata is a first-class state.** Missing thumbnails, wrong titles, and expired images are routine; every surface must look composed without them.
5. **The collection is personal; the graph is optional.** Social features add to a collection that is complete and useful alone.

## Accessibility & Inclusion

No product-specific standard has been established. The kitchen scene — arm's length, glancing, imperfect lighting, occupied hands — sets a practical floor on type size and tap-target size that exceeds the usual minimums.
