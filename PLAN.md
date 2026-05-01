# Product Roadmap

Last updated: 2026-04-21

## Context

Recipe-saver already has a strong foundation: social graph (follows, followers, notifications, user discovery), AI-powered extraction (Instagram, YouTube, structured web scraping via Cheerio + Claude), share tokens, and a clean tagging system.

The strategic edge is the **social graph** — most recipe apps treat social as an afterthought. The goal is to leverage this graph to build engagement loops that competitors can't easily replicate.

What's currently missing: engagement loop (reasons to come back daily), and the utility layer that makes saved recipes actionable.

---

## Tier 1 — Ship Next

### 1. Recipe Collections / Cookbooks
- Named collections ("Weeknight Dinners", "Summer BBQ")
- Recipes can belong to multiple collections
- Collections are shareable and followable — uses the existing social graph
- **Why first:** Every competitor has this; users with 50+ saves have no real organization beyond tags. Shareable/followable collections are the social graph's killer feature.

### 2. Comments & Reactions on Recipes
- Comments on shared/public recipes
- Simple reactions: saved, made it, want to try
- Surfaces reactions from people you follow
- **Why first:** You have followers but nowhere to talk. This is the engagement loop. Cookpad built their whole business here.

### 3. Explore / Discovery Feed
- Trending tab: most-saved recipes this week
- Popular among people you follow
- Recently shared by the community
- **Why first:** Low-hanging fruit — saves data already exists. Turns the app into a place for discovery, not just personal storage.

---

## Tier 2 — Next Quarter

### 4. "Made It" Cooking Log
- Mark recipes as cooked with date, optional photo/note
- Most-requested feature across recipe apps
- Closes the loop: save → cook → log
- Rich data for future recommendations

### 5. Ingredient Parsing + Shopping Lists
- Parse ingredients from already-scraped recipe pages
- Select recipes for the week → merged shopping list
- The #2 feature across all competitor apps
- Converts casual users into daily users

### 6. TikTok / Reels Import
- Extend existing AI extraction pipeline to TikTok
- Grab caption + transcript, extract recipe via Claude
- TikTok is where food content lives now; Pestle built their whole product around this

---

## Tier 3 — Longer Bets

### 7. Collaborative Collections
- Shared boards multiple users can add to (couples, roommates, families)
- More universally useful than Pestle's FaceTime-during-cooking feature

### 8. Meal Planning Calendar
- Drag recipes onto a weekly calendar
- Auto-generate shopping list from the week's plan
- Table-stakes for power users; every major competitor has it

### 9. Recipe Recommendations
- Needs "Made It" + reaction data first
- "People who saved this also saved..." / "Trending among your followers"

---

## Competitive Landscape Summary

| App | Strength |
|-----|----------|
| Paprika | Best-in-class personal organization, meal planning |
| Mela / Pestle | Clean iOS UX, TikTok/video import |
| Plan to Eat | Meal planning + shopping lists |
| Cookpad | Community, user-generated recipes, comments |
| Samsung Food | Smart appliance integration |
| Yummly | Shut down Dec 2024 |

**Our differentiator:** Social graph + AI extraction. No competitor has both. Build the social engagement layer before anyone catches up.
