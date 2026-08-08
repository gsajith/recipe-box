---
name: RecipeBox
description: Save any recipe from anywhere, and find it again when it's time to cook.
colors:
  cream: "#FAF7EF"
  surface-white: "#FFFFFF"
  oat: "#EEE8DC"
  enamel-green: "#234b39"
  enamel-green-deep: "#132A1F"
  terracotta: "#C86C44"
  terracotta-strong: "#B25B39"
  terracotta-deep: "#A14F34"
  butter-yellow: "#F5C73A"
  chili-red: "#C94832"
  ink: "#1A1A1A"
  clay-grey: "#6B6055"
  parchment-line: "#DDD6CA"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(3rem, 7vw, 5rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "0.875rem 1.75rem"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
    textColor: "{colors.surface-white}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.clay-grey}"
    rounded: "{rounded.full}"
    padding: "0.875rem 1.75rem"
  button-icon:
    backgroundColor: "{colors.enamel-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    height: "38px"
    width: "38px"
  button-icon-hover:
    backgroundColor: "{colors.enamel-green-deep}"
    textColor: "{colors.surface-white}"
  input-field:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0.875rem 1rem"
  chip-tag:
    backgroundColor: "{colors.enamel-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "0.375rem 0.875rem"
  chip-tag-outline:
    backgroundColor: "transparent"
    textColor: "{colors.enamel-green}"
    rounded: "{rounded.full}"
    padding: "0.2rem 0.625rem"
  chip-filter:
    backgroundColor: "{colors.oat}"
    textColor: "{colors.clay-grey}"
    rounded: "{rounded.full}"
    padding: "0.4rem 0.75rem"
  chip-filter-active:
    backgroundColor: "{colors.enamel-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "0.4rem 0.75rem"
  card-recipe:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  badge-notification:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    height: "17px"
---

# Design System: RecipeBox

## Overview

**Creative North Star: "The Enamel Kitchen"**

Deep green enamelware set against cream, trimmed in terracotta. Every surface in RecipeBox behaves like a well-made kitchen object rather than a software panel: it has an edge you can see (a 1.5px border, never a hairline), a weight you can feel (it lifts toward you when you reach for it), and a finish that survives use. The ground is warm paper-cream (`#FAF7EF`), never white and never grey — white is reserved for the cards that sit *on* it, which is what makes a card read as an object placed on a counter rather than a region of the page.

The type carries the warmth the palette establishes. Playfair Display names things — recipe titles, page headings, the wordmark, a person's display name — with real serif authority at heavy weights and tight tracking. DM Sans says everything *about* those things: meta, labels, buttons, body. That split is the system's most consistent rule and the reason a recipe card reads as a clipping rather than a database row.

The product exists to rescue recipes from ad-choked blog pages and lost Instagram saves, so the interface is deliberately the opposite of what it saves from: one column, one action, nothing blinking for attention. It is equally not a generic dashboard. There is no blue, no grey card on a grey background, no Inter. Photography does the loud work; the chrome stays warm, sturdy, and quiet around it.

**Key Characteristics:**
- Warm cream ground with white object-cards, never grey-on-grey
- Deep green for structure and identity; terracotta for the one action that moves you forward
- Playfair Display names things, DM Sans explains them
- Visible 1.5px borders everywhere — the edge is part of the design, not a fallback
- Cards lift 4px toward the cursor; depth is a response, never decoration
- Pill-shaped controls, 12px input fields, 20px content cards, circles for identity
- Below 640px, floating chrome becomes 72%-black blurred pills over photography

## Colors

A warm, food-adjacent palette: cream and oat for ground, one deep green for everything structural, one terracotta for everything actionable, and a butter yellow held in reserve.

### Primary
- **Enamel Green** (`#234b39`): The structural voice. Chrome, the `Box` half of the wordmark, selected filter chips, applied tags, icon buttons, avatar rings, the profile page's bottom slab, the landing nav and hero ground, and the border a card takes on when you hover it. If an element expresses state or structure rather than invitation, it is green.
- **Enamel Green Deep** (`#132A1F`): The pressed and hovered state of every green surface, plus the fill behind an avatar initial. Never a resting background on its own except inside the profile composition.

### Secondary
- **Terracotta** (`#C86C44`): The action color and the `Recipe` half of the wordmark. Every button that advances the user is terracotta: Add Recipe, Save, Follow, Sign in, the clipboard banner's Save, the notification count badge. It also carries the numeric stats on a profile and the eyebrow labels on the landing page.
- **Terracotta Deep** (`#A14F34`): Hover state for every terracotta surface. Nothing rests at this value.

### Tertiary
- **Butter Yellow** (`#F5C73A`): Held in reserve. It appears on exactly three things: the hero's italic emphasis line, the "Free to use" badge, and the yellow plane of the profile card. Its scarcity is deliberate — it is the system's brightest value and reads as a highlight, not a surface.

### Neutral
- **Cream** (`#FAF7EF`): The page ground everywhere in the app, and the color of type set on green. Never substitute white for it.
- **Surface White** (`#FFFFFF`): Cards, modals, inputs, dropdowns, panels. White means "an object on the cream."
- **Oat** (`#EEE8DC`): The recessed tone — thumbnail placeholders, disabled buttons, hovered menu rows, edit-mode sub-panels, the share and share-target page grounds, and the resting fill of a filter chip. Where another system would use a shadow to push something back, this one uses oat.
- **Ink** (`#1A1A1A`): Primary text. Near-black, never pure black.
- **Clay Grey** (`#6B6055`): Secondary text — meta rows, labels, placeholders, source links. It is a warm brown-grey, not a neutral grey, and that warmth is load-bearing.
- **Parchment Line** (`#DDD6CA`): Every border in the system, and the color of the `·` separators between meta items.

### Utility
- **Chili Red** (`#C94832`): Destructive only. A delete button is green at rest and turns chili red on hover and while confirming. Sign-out is chili red text. It is never used for emphasis or as an accent.

### Named Rules

**The Green House Rule.** Deep green is the house — structure, chrome, identity, selected state. It can cover whole regions (nav, hero, profile slab) and it never asks for a click by itself.

**The One Door Rule.** Terracotta is the door: the single action that moves the user forward. It appears **once per region** — a header, a banner, a card, a modal, a row in a list. Two terracotta buttons competing inside the same region is one too many; demote the lesser to the ghost pill.

*Narrowed 2026-08-08.* The rule previously said "once per view," which the shipped product contradicted everywhere and the component table below contradicted on paper: the recipe list carries Add Recipe in its header while the clipboard banner carries Save, and `/users` carries a Follow on every row. Both are correct — each is the forward action of its own region, and a follow list with one terracotta button would be arbitrary about which person got it. What the rule forbids is two doors bidding for the same decision. When regions stack, distance and containment do the disambiguating: the banner is a separate object at the other end of the screen, not a second option inside the header.

> **Two terracottas, and the size of the label decides which.** White on `--orange` (`#C86C44`) measures **3.69:1**. That clears the 3:1 WCAG large-text bar and fails the 4.5:1 normal-text bar, so it is only legitimate on labels that are **≥18.66px bold or ≥24px** — the detail modal's "Open recipe" door (19.2px/700) and the landing CTA (19.2px/700). Everything smaller uses `--orange-strong` (`#B25B39`, **4.73:1**): Add Recipe, Follow, Follow back, the clipboard Save, both share-page saves, and the settings Save.
>
> *Revised 2026-08-08.* The exception recorded on 2026-08-07 was written as though it covered every terracotta button. It never did — it was measured on Add Recipe (15.2px/600), Follow (14px/600) and the clipboard Save (13.1px/700), none of which reach the large-text bar, so those were plain AA failures rather than an accepted trade. Both hues are terracotta and read as the same door; only the one carrying small type is tuned. Choose by measuring the label, not by eye. And keep every terracotta button identifiable by shape, position and label rather than by color alone.

**The Inversion Rule.** On green or terracotta grounds, controls do not switch palettes — they invert into white-alpha tiers: `rgba(255,255,255,0.15)` fill, `rgba(255,255,255,0.3–0.4)` border, `rgba(255,255,255,0.85)` text, solid white when active. The profile page and the landing nav both run on this; any new surface on a colored ground must too.

**The Warm Grey Rule.** There is no neutral grey in this system. Every grey is warm (`#6B6055`, `#DDD6CA`, `#EEE8DC`). A cool grey anywhere reads instantly as foreign.

## Typography

**Display Font:** Playfair Display (with Georgia, Times New Roman, serif) — weights 400/600/700/800, roman and italic
**Body Font:** DM Sans (with -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif)

**Character:** A high-contrast Transitional serif doing the naming and a warm geometric sans doing the explaining. Playfair runs heavy (700–800) with tight negative tracking, so headings feel set rather than styled; DM Sans stays small, medium-weight, and unfussy so it never competes. The pairing is editorial without being a magazine pastiche — it reads as a recipe *collection*, not an article.

### Hierarchy
- **Display** (Playfair 800, `clamp(3rem, 7vw, 5rem)`, line-height 1.08, tracking -0.025em): The landing hero only. Its third line is italic in butter yellow — that italic emphasis is the single most identity-carrying piece of type in the product.
- **Headline** (Playfair 800, `clamp(2rem, 5vw, 3rem)`, tracking -0.02em): Landing section closers and the profile display name (italic). Section titles inside the app sit at the low end (2.25rem, weight 700).
- **Title** (Playfair 700, 1.2rem, line-height 1.35): Recipe card titles, feature card headings, notification panel title, settings section titles. Clamped to two lines on grid cards, one line in list rows.
- **Body** (DM Sans 400, 0.95rem, line-height 1.5): Interface prose and inputs. Landing prose opens to line-height 1.75 and caps at 480px measure; app body text stays tight.
- **Label** (DM Sans 700, 0.72–0.78rem, tracking 0.08em, uppercase): Section labels inside the recipe detail — NOTES, tag suggestion groups. The landing eyebrow runs a touch smaller and wider (0.7rem, 0.1em) in terracotta.
- **Meta** (DM Sans 500, 0.75–0.8rem, clay grey): Cook time, servings, source links, timestamps, handles. Always separated by a `·` in parchment line color.

### Named Rules

**The Naming Rule.** Playfair sets the *names* of things — recipe titles, page titles, section headings, a person's display name, the wordmark. DM Sans sets everything the interface says *about* them. No exceptions: a serif button label or a sans recipe title both break the system immediately.

**The Italic Identity Rule.** Italic Playfair is reserved for identity moments — the wordmark, the hero's emphasized line, a display name, a stat count. It is never used for body text, quotes, or emphasis in prose.

**The Wordmark Rule.** RecipeBox is always set as italic serif with `Recipe` in terracotta and `Box` in enamel green, at weight 800 with -0.025em tracking. On green grounds the whole wordmark goes cream. It is never one color on cream, never all-caps, never tracked out.

Playfair is loaded as a variable font across its full `400–900` range with both roman and italic (`app/layout.tsx`), so weight 900 is real type rather than a synthesized bold. It is used at 900 only in the profile composition — display name, stat counts, avatar initial, and the fan's "+N" chip — and only in italic. Elsewhere the ceiling is 800.

## Layout

Every app surface is a single centered column: `max-width: 1060px`, 2rem padding, dropping to 1rem at 770px. There is no sidebar, no persistent global nav, and no second column anywhere in the product — the header is a wordmark on the left and a notification bell plus user menu on the right, with 2.5rem of air beneath it.

The recipe grid is `repeat(auto-fill, minmax(260px, 1fr))` with a 1.5rem gap, which yields three columns at full width and reflows to one on a phone without a breakpoint. List view collapses the same cards to a single column with a 0.75rem gap and a 110px fixed thumbnail rail on the left, 100px minimum row height. Controls sit in a wrapping flex row above the grid — wrapping rather than horizontally scrolling, because a scroll container would clip the portalled filter menus on both axes.

Spacing is a de-facto rhythm rather than a declared scale: 0.375 / 0.5 / 0.75 / 1 / 1.25 / 1.5 / 2rem, with 1.25rem inside grid cards, 2rem inside modal content, and 1rem inside list rows. Breakpoints in use are 770px (container padding and landing layout), 640px (modals go full-bleed, notification panel becomes a sheet, user grid goes single-column), 740px (the profile composition restacks), and 500/480/400px for individual control rows.

**The 1060 Rule.** Content lives in a 1060px column on cream. Full-bleed color is allowed only for the landing hero, the landing CTA, the notification sheet, and the profile composition — surfaces whose job is atmosphere, not task.

**The Wrap-Never-Scroll Rule.** Filter and control rows wrap to a second line. They never become horizontal scrollers: off-screen controls read as absent, and a scroll container clips the dropdown menus that open from them.

## Elevation & Depth

Hybrid, weighted toward tonal. Depth comes first from the border-and-ground relationship — a white card with a 1.5px parchment border on cream is already legible with no shadow at all — and shadows then add physical weight. The three-step shadow scale is soft, warm-neutral, and low-opacity (7%, 11%, 14%); nothing in this system casts a hard shadow.

Recessed depth is expressed *tonally*, never with an inset shadow: an edit panel, a disabled button, a thumbnail placeholder, and a hovered menu row all drop to oat rather than darkening.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.07)`): Cards, primary buttons, the user menu trigger, the notification bell. Just enough to separate an object from the cream.
- **Raised** (`box-shadow: 0 4px 16px -2px rgb(0 0 0 / 0.11)`): Hover state for buttons and menu triggers, and the resting state of floating icon buttons over photography.
- **Lifted** (`box-shadow: 0 16px 32px -4px rgb(0 0 0 / 0.14)`): Card hover, modals, the profile avatar ring. The top of the scale.
- **Terracotta Glow** (`box-shadow: 0 4px 24px rgba(200, 108, 68, 0.45)` → `0 8px 32px rgba(200, 108, 68, 0.55)` on hover): The landing CTA and the share page's save button only. A colored shadow is a marketing-surface device, not an app-surface one.
- **Sheet** (`box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08)` / `0 8px 32px rgba(0, 0, 0, 0.22)`): The notification panel's left edge and the clipboard banner respectively — the two elements that float above the page rather than sitting in it.
- **Focus ring** (`--ring-focus: 0 0 0 3px rgb(35 75 57 / 0.1)`): The only "shadow" that is not about depth. It pairs with a green border shift on every focused field and is a token precisely so it cannot drift from `--primary`.

### Named Rules

**The Counter Rule.** Cards are objects on a counter. On hover they lift 4px (`translateY(-4px)`), take the Lifted shadow, and shift their border to enamel green, over 0.25s on `cubic-bezier(0.4, 0, 0.2, 1)`. Buttons lift 1–2px on the same idea. Anything that responds to a pointer moves toward it.

**The Tonal Recess Rule.** Nothing is pushed *back* with a shadow. Recessed states — disabled, placeholder, sub-panel, hovered row — drop to oat (`#EEE8DC`). Inset shadows do not exist in this system.

**The Full-Bleed Rule.** Below 640px, a modal stops being a card: it sheds its radius, border, and shadow, fills `100dvh`, and its overlay becomes solid white rather than a blurred scrim. Floating chrome over photography converts to `rgba(0,0,0,0.72)` pills with a 6px backdrop blur, because a green button on an unknown photo is a contrast gamble and a smoked-glass pill is not.

## Shapes

Corner radius encodes function, and it is consistent enough across the product to read as a rule:

- **Pill** (`9999px`) — anything you press. Buttons, tags, chips, filter triggers, badges, the search field, the follow button, the "follows you" marker.
- **Soft rectangle** (12px) — anything you type into or read a list from. Text inputs, dropdown menus, sub-panels, notification thumbnails, the view-mode toggle.
- **Content card** (20px) — anything that holds content. Recipe cards, modals, feature cards, the share card, user cards.
- **Small** (8px) — icon-button hit areas, the crop modal's buttons, the fanned thumbnails.
- **Circle** (50%) — identity and single-icon actions. Avatars, the notification bell, close/share buttons, the "new" dot.

Borders are `1.5px` almost everywhere — heavier than the 1px reflex, and deliberately visible. The exceptions are meaningful: 1px on notification rows and thumbnails (where 1.5px would read as heavy at that scale), 2px on the follow button (a transparent border reserving space so the button doesn't shift between states), 3–4px white on fanned thumbnails and avatars (a photo-print mount), and 40px enamel green on the profile avatar (a ring, not a border).

**The Pill-For-Action Rule.** If it can be pressed, it is a pill. A rounded-rectangle button is off-system.

**The Visible Edge Rule.** Borders are 1.5px and they are meant to be seen. Do not thin them to 1px for refinement, and do not replace a border with a shadow — in this system the edge *is* the form.

## Components

### Buttons
- **Shape:** Full pill (`9999px`) in every variant.
- **Primary:** Terracotta fill, white text, weight 600–700, 0.875rem vertical padding (1.375rem horizontal on the icon+label variant), Resting shadow. Hover: terracotta deep, Raised shadow, `translateY(-1px)` (-2px on the landing CTA). Active returns to `translateY(0)`. Disabled: oat fill with clay grey text, never a faded terracotta.
- **Secondary / Ghost:** Transparent fill, 1.5px parchment border, clay grey text, weight 600. Hover darkens the border and text to ink. Used for Cancel beside every primary.
- **Icon button:** 38px enamel green circle, white icon, Raised shadow. Hover: green deep and `scale(1.1)`. Over photography on mobile it becomes a 72%-black blurred pill instead.
- **Destructive:** Starts as a green pill with a label, turns chili red on hover, and pulses (`scale 1 → 1.08 → 1`, 0.6s) when it enters its confirm state. Delete is always two-step, never instant.
- **Text button:** Underlined clay grey at 0.85rem for "Clear all" style resets; hover goes enamel green.

### Chips
Two distinct chip families that must not be confused:
- **Tag, filled** (enamel green fill, white text, weight 600, 0.375rem × 0.875rem): a tag *applied* to a recipe — in the detail modal and on the share page. Its remove affordance is a white-alpha × that goes solid white on hover.
- **Tag, outlined** (transparent, 1.5px enamel green border, green text, 0.2rem × 0.625rem): the same tag *displayed* on a card. Outlined means "read only."
- **Filter chip** (oat fill, 1.5px parchment border, clay grey text): unselected. Hover shifts border and text to green. Selected inverts to solid green with white text. The "show all" variant uses a dashed border.
- **Filter dropdown trigger:** the same chip shape with a chevron, capitalized in CSS (tags are stored lowercase), label clamped to 9rem, and its menu portalled to `<body>` and positioned from the trigger rect.

### Cards / Containers
- **Corner style:** 20px.
- **Background:** Surface white on the cream page ground.
- **Border:** 1.5px parchment line, becoming enamel green on hover.
- **Shadow strategy:** Resting → Lifted on hover with a 4px rise (see The Counter Rule).
- **Internal padding:** 1.25rem in grid view, 0.875rem × 1rem in list view.
- **Anatomy:** 200px cover image (110px square rail in list view) with the source badge pinned top-left at 0.5rem; Playfair title clamped to two lines; meta row of cook time and servings separated by `·`; outlined tags; a delete pill that fades in only on card hover.

### Inputs / Fields
- **Style:** Surface white, 1.5px parchment border, 12px radius, 0.875rem × 1rem padding, 0.95rem DM Sans. The search field is the exception — same treatment at pill radius with a 2.75rem left inset for its icon.
- **Focus:** Border shifts to enamel green plus a 3px soft ring at `var(--ring-focus)` — `0 0 0 3px rgb(35 75 57 / 0.1)`, derived from `--primary`. Always use the token; a hand-written rgba here is how the ring drifted a shade off the border color it pairs with.
- **Disabled:** Oat fill at 0.6 opacity.
- **Error:** Chili red text at 0.8rem beneath the field; a page-level error banner uses `color-mix` at 10% fill and 30% border of chili red.

### Navigation
There is no nav bar in the app — the header is the wordmark (a link home) plus the notification bell and user menu, with 2.5rem of space below it. The user menu is a pill trigger with a 28px avatar, name, and rotating chevron, opening a 12px-radius white dropdown; sign-out is chili red at the bottom behind a divider. The notification bell is a 38px circle carrying a terracotta count badge ringed 1.5px in the page cream so it reads cleanly against the border beneath it. On the landing page only, a fixed green nav holds the cream wordmark and a text sign-in link that goes butter yellow on hover.

### Source Badge
Recipes carry their origin as the platform's own mark — a 22px Instagram or YouTube icon with `drop-shadow(0 1px 2px rgba(0,0,0,0.35))` and no chip around it, so it stays legible on arbitrary photography without boxing a brand mark inside a foreign container. Sources with no recognizable mark fall back to a small butter yellow pill in uppercase green. The Instagram mark is built from two stacked radial gradients with `useId()`-scoped ids, because several badges share a page.

### The Profile Composition (signature — social surfaces only)
The profile page is the system's expressive register and the one place the geometry goes big: a circular avatar in a 40px enamel green ring overlapping a butter yellow plane whose top-right corner is a 200px sweep; a white inset card carrying the italic Playfair name, handle, and terracotta stat counts; and beneath it a green slab holding a terracotta container that expands into the recipe list. Collapsed, that container shows a fanned deck of 150px white-mounted thumbnails, each rotated 9° off its neighbor with a 13px vertical arc and a 75ms staggered spring entrance (`cubic-bezier(0.34, 1.26, 0.64, 1)`). At 740px the whole composition restacks vertically, the avatar tucking up into a 200px-radius scoop.

This vocabulary — oversized radii, overlapping planes, physical stacking — belongs to profiles, feeds, and social surfaces. Task surfaces (the recipe list, detail modal, settings, onboarding) stay in the quieter card system. Keep the two registers distinct rather than blending them.

## Do's and Don'ts

### Do:
- **Do** put white cards on the cream ground (`#FAF7EF`). Cream is the page; white means "object."
- **Do** reserve terracotta for the action that moves the user forward, and use exactly one per region (The One Door Rule).
- **Do** pick the terracotta by measuring the label: `--orange` at ≥18.66px bold or ≥24px, `--orange-strong` everywhere else.
- **Do** set names in Playfair and everything else in DM Sans (The Naming Rule).
- **Do** keep borders at 1.5px and visible. The edge is the form (The Visible Edge Rule).
- **Do** express recessed states tonally with oat (`#EEE8DC`) rather than with inset shadows.
- **Do** invert controls into white-alpha tiers on green or terracotta grounds instead of introducing a second palette (The Inversion Rule).
- **Do** move interactive surfaces toward the cursor: 4px for cards, 1–2px for buttons, `scale(1.1)` for icon circles.
- **Do** convert floating chrome to `rgba(0,0,0,0.72)` blurred pills when it sits over photography on mobile.
- **Do** design every card and row for a missing thumbnail — an oat placeholder that pulses while loading and stops pulsing on error is the shipped behavior, and it is the common case.
- **Do** make destruction two-step: hover to chili red, click to arm with a pulse, click again to commit.
- **Do** extend `prefers-reduced-motion` coverage when adding motion. Only `RecipeThumbnail` currently honors it; the fan, panel slide, and banner entrance do not.

### Don't:
- **Don't** introduce a cool grey, a blue, or Inter. That combination is the generic-dashboard look this system is defined against.
- **Don't** let a surface accumulate competing calls to attention — badges, banners, and promos stacked around content is the recipe-blog clutter the product exists to escape.
- **Don't** use chili red for anything but destruction. It is not an accent.
- **Don't** promote butter yellow to a surface color. It appears on the hero italic, the free badge, and the profile plane — that scarcity is what makes it read as highlight.
- **Don't** give a pressable element a rounded rectangle. Pills for actions, 12px for fields, 20px for content.
- **Don't** replace a border with a shadow, or thin a 1.5px border to 1px for "refinement."
- **Don't** bring the profile page's oversized radii, overlapping planes, or fanned deck into task surfaces. Two registers, kept apart.
- **Don't** spend weight 900 outside the profile composition — it is the signature register's ceiling, not a general emphasis tool.
- **Don't** hand-write a focus ring. Use `var(--ring-focus)` so it stays derived from `--primary`.
- **Don't** make a control row scroll horizontally; wrap it (The Wrap-Never-Scroll Rule).
