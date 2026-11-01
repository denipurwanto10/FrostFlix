# FrostFlix — UI Design Guidelines

**Direction:** premium cinematic discovery, not a dashboard.
**Keywords:** dark navy, ice-blue accent, editorial typography, restrained motion, generous spacing.

---

## 1. Design intent

FrostFlix should feel like a streaming service's editorial layer: large film imagery, quiet chrome,
one accent hue, and typography that carries hierarchy instead of borders and shadows.

Three rules that resolve most decisions:

1. **The artwork is the color.** Movie posters and backdrops provide saturation. The UI itself stays
   navy, charcoal, white, and muted gray, with ice blue reserved for interaction.
2. **Chrome recedes.** Navigation, filters, and metadata are low-contrast surfaces with hairline
   borders. Nothing competes with the hero or the posters.
3. **Motion confirms, never entertains.** 120–280 ms, small distances, no bounce, no autoplay.

---

## 2. Brand

### 2.1 Logo

- Mark: Lucide `Snowflake` glyph, 20 px, stroke 2, color `--primary` (`#38BDF8`).
- Wordmark: `FROSTFLIX`, Inter Tight 700, uppercase, `letter-spacing: -0.01em`, 18 px desktop /
  17 px mobile, color `--foreground`.
- Lockup: mark + 8 px gap + wordmark, aligned to text baseline. Total height 24 px.
- Clear space: 0.5× mark height on all sides. Minimum width: 112 px.
- On imagery (transparent navbar), the lockup keeps a subtle text-shadow
  `0 1px 12px rgba(0,0,0,0.45)` for legibility.
- Favicon: the mark on `--background`, 32×32 with 6 px radius. No gradients.

### 2.2 Tagline

"Discover. Explore. Enjoy." — micro-label style, used in the footer and the empty watchlist state.
Not in the navbar (keeps the header quiet).

---

## 3. Color system

Defined once in `src/index.css` as CSS variables, exposed to Tailwind v4 via `@theme inline`.

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#070A12` | page canvas |
| `--surface` | `#0C121D` | navbar, cards, panels |
| `--surface-2` | `#111A27` | inputs, skeletons, chips |
| `--surface-3` | `#16212F` | hover fill, elevated panel |
| `--border` | `#1D2837` | hairlines, dividers |
| `--border-strong` | `#2B3B50` | focused containers, active chips |
| `--foreground` | `#F2F6FB` | primary text |
| `--muted-foreground` | `#94A3B8` | secondary text, metadata |
| `--subtle-foreground` | `#7C8CA3` | tertiary text (min 13 px) |
| `--primary` | `#38BDF8` | CTAs, active states, focus accents |
| `--primary-hover` | `#7DD3FC` | hover |
| `--primary-foreground` | `#041018` | text on ice |
| `--primary-soft` | `rgba(56,189,248,0.12)` | active chip fill, selected row |
| `--rating` | `#F5C26B` | star icon + score only |
| `--danger` | `#F87171` | destructive actions, error icons |
| `--overlay` | `rgba(3,6,12,0.72)` | scrims, dialog backdrop |
| `--ring` | `#7DD3FC` | `focus-visible` outline |

Rules:

- **No second accent hue.** No purple, pink, teal, or green highlights. Ratings are the only warm
  color and only on the star + number.
- Ice blue is for **interaction and selection**, never for body copy or large fills. Primary buttons
  and active filter chips are the maximum allowed dose.
- Never place text directly on a photo without a scrim (≥ 45% black gradient or blur).
- Semantic color is always paired with an icon or text, never color alone.
- Contrast targets: body ≥ 4.5:1, large text ≥ 3:1, UI borders ≥ 3:1 against adjacent fill where the
  border is the only affordance.

### 3.1 Token block (reference)

```css
:root {
  --background: #070a12;
  --surface: #0c121d;
  --surface-2: #111a27;
  --surface-3: #16212f;
  --border: #1d2837;
  --border-strong: #2b3b50;
  --foreground: #f2f6fb;
  --muted-foreground: #94a3b8;
  --subtle-foreground: #7c8ca3;
  --primary: #38bdf8;
  --primary-hover: #7dd3fc;
  --primary-foreground: #041018;
  --rating: #f5c26b;
  --danger: #f87171;
  --ring: #7dd3fc;
  --radius: 0.75rem;
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-border: var(--border);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-rating: var(--rating);
  --color-danger: var(--danger);
  --radius-lg: var(--radius);
}
```

---

## 4. Typography

| Role | Family | Size / line-height | Weight | Tracking |
|------|--------|--------------------|--------|----------|
| Hero title | Inter Tight | `clamp(2.25rem, 1.4rem + 3.2vw, 4rem)` / 0.98 | 700 | -0.03em |
| Page title | Inter Tight | 32–40 px / 1.1 | 600 | -0.02em |
| Section heading | Inter Tight | 20–24 px / 1.25 | 600 | -0.01em |
| Card title | Inter | 14–15 px / 1.35 | 500 | 0 |
| Body | Inter | 15–16 px / 1.65 | 400 | 0 |
| Meta / labels | Inter | 13–14 px / 1.4 | 400–500 | 0 |
| Micro label | Inter | 11 px / 1.2, uppercase | 600 | 0.16em |
| Numbers | Inter `tabular-nums` | inherit | 500 | 0 |

Rules:

- Two families only, self-hosted variable fonts (`@fontsource-variable/inter`,
  `@fontsource-variable/inter-tight`). `font-display: swap`, preload the body font only.
- Headings use tight tracking; body never goes below 14 px, tertiary text never below 13 px.
- Long overviews cap at `68ch`; hero overview clamps to 3 lines on mobile, 4 on desktop.
- Titles clamp to 2 lines in grids (`line-clamp-2`) with the full title in `title` and `aria-label`.
- Use `text-balance` for hero and page titles; `text-pretty` for paragraphs.
- No all-caps body text, no italics for emphasis (tagline is the single exception).

---

## 5. Spacing, radius, elevation

- **Spacing scale:** 4 px base — 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96.
- **Section rhythm:** 40 px (mobile) / 56 px (tablet) / 72 px (desktop) between home rows.
- **Container:** max-width 1600 px; gutters 16 / 24 / 40 px at mobile / tablet / desktop.
  Carousels bleed past the right gutter to signal scrollability.
- **Radius:** 6 px (inputs small), 8 px (buttons), 12 px (chips/panels), 14 px (cards, dialogs),
  999 px (pills, avatars).
- **Elevation:** surfaces step up by color, not shadow. One shadow exists for overlays:
  `0 24px 80px -24px rgba(0,0,0,0.9)`.
- **Borders:** 1 px `--border`; hover/focus raises to `--border-strong` or `--primary/40`.
- **Hairlines:** never thicker than 1 px except focus rings (2 px).

---

## 6. Layout and breakpoints

| Breakpoint | Width | Grid columns | Notes |
|-----------|-------|--------------|-------|
| base | < 640 | 2 | single-column details, sheet nav |
| `sm` | ≥ 640 | 3 | inline search icon |
| `md` | ≥ 768 | 4 | inline nav links, 2-col details intro |
| `lg` | ≥ 1024 | 5 | poster overlaps backdrop |
| `xl` | ≥ 1280 | 6 | full hero copy width |
| `2xl` | ≥ 1536 | 6 | container caps at 1600 px |

- Mobile-first; no horizontal page scroll at any width (carousels scroll internally).
- Navbar height 64 px mobile / 72 px desktop; sticky, `z-40`. Dialogs `z-50`.
- Content never sits under the sticky navbar on non-home routes (solid navbar there).
- Safe areas respected on iOS (`env(safe-area-inset-*)` for the mobile nav sheet).

---

## 7. Imagery

- Posters: 2:3, `object-cover`, radius 14, `bg-surface-2` behind while loading.
- Backdrops: 16:9, always with a scrim; hero backdrop is the only eager image.
- Hero composition: backdrop right-weighted, copy left; two gradients
  (left-to-right dark → transparent, bottom → `--background`).
- Fallbacks: missing poster = surface + film icon + initials in `--subtle-foreground`; missing
  backdrop = poster scaled and blurred behind the scrim.
- No image is stretched; no `object-fit: fill`. No visible broken-image icons.
- Do not overlay text on busy poster areas; captions sit below or on a gradient scrim.
- Hover on a card may brighten the poster (`filter: brightness(1.06)`) — never saturate it.

---

## 8. Component specifications

### 8.1 Navbar

- Left: logo lockup → `/`. Center-left: `Home`, `Explore`, `Watchlist` (14 px, 500).
- Right: search field (desktop, 220 px, expands to 280 px on focus) or search icon (mobile),
  watchlist count badge (`--primary-soft` pill, 11 px).
- Transparent over the home hero at scroll 0; from 24 px scroll: `--background/85` +
  `backdrop-filter: blur(12px)` + bottom hairline. On other routes: solid from the start.
- Active link: white text + 2 px ice underline offset 6 px; inactive: `--muted-foreground`.
- Mobile: hamburger opens a right sheet (surface, 280 px) with links + region/language preferences.

### 8.2 Hero banner

- Height: `min(78vh, 720px)`, minimum 520 px.
- Content max-width 640 px, bottom-left aligned, 24–48 px from the container edge.
- Eyebrow: micro-label "Trending this week".
- Title, meta row (`year · runtime · ★ 8.4 · genres`), 3–4 line overview, actions:
  `More info` (primary), `Trailer` (outline, icon), watchlist icon button.
- Slide dots bottom-right (5 max), 6 px, active = ice and 24 px wide (pill), `aria-label` per slide.
- Crossfade 700 ms on change; **no** auto-rotation under `prefers-reduced-motion`; no autoplay video.
- Backdrop `fetchPriority="high"`, `loading="eager"`.

### 8.3 Movie card

Two variants, one component:

| Variant | Used in | Caption |
|---------|---------|---------|
| `poster` | carousels | title + year revealed in a bottom scrim on hover/focus; always visible on touch |
| `detailed` | grids, watchlist | title (2-line clamp), year + rating below the poster |

- Poster 2:3, radius 14, border 1 px transparent → `--primary/35` on hover/focus-within.
- Hover: `translateY(-4px)`, 160 ms, plus poster brightness 1.06. No scale on the image itself.
- Rating badge: top-right, 28 px, `--overlay` pill, star 12 px in `--rating`, number 12 px white.
- Watchlist button: top-left, 32 px, appears on hover/focus (always visible on touch); filled ice
  when saved, outline otherwise; `aria-pressed`.
- Whole card is a link; the watchlist button is a sibling button, never nested inside the link.
- Focus: 2 px `--ring` ring with 2 px offset, visible on the card container.
- Card min width 140 px (mobile), 160–200 px (desktop carousel).

### 8.4 Carousel

- Native horizontal scroll + `scroll-snap-type: x proximity`, 12–16 px gap.
- Arrow buttons: 40 px circle, `--background/80`, hairline border, chevron 18 px; disabled at ends;
  scroll by 80% of the visible width.
- Header: section title left, "See all →" text link right (14 px, muted → white on hover).
- Edge fade: 40 px gradient mask on the right while more content exists.
- Scrollbar hidden but the region remains keyboard-scrollable (`tabindex="0"`, arrow keys, focus
  ring). `ul/li` semantics, `aria-label` on the region.
- 20 items max per row; no infinite scroll inside a row.

### 8.5 Grid

- `grid-cols-2 sm:3 md:4 lg:5 xl:6`, gap 16 px mobile / 24 px desktop.
- Row gap 28–32 px to accommodate captions.
- Skeletons match exact card dimensions (poster box + 2 text lines) to prevent CLS.
- Infinite scroll sentinel 600 px before the end; also a visible "Load more" button fallback.

### 8.6 Filter bar (Explore)

- Sticky below the navbar (`top: 64/72px`), background `--background/90` + blur, bottom hairline.
- Controls: Genre, Year, Rating, Sort — 40 px tall, `--surface-2`, radius 8, 13–14 px text.
- Active filters render as removable chips below (ice-soft fill, X icon, `aria-label="Remove filter: …"`).
- "Reset" text button appears only when filters differ from defaults.
- Mobile: two primary selects inline, the rest in a "Filters" sheet; chips scroll horizontally.

### 8.7 Search

- Input 44 px (page) / 36 px (navbar), radius 10, icon left 16 px, clear button right.
- Focus: border `--primary/60`, ring `--primary/20`, no glow.
- States: idle (hint + genre shortcuts), loading (thin 2 px indeterminate bar under the input +
  previous results dimmed to 60%), results, empty, error.
- Empty: `SearchX` icon, "No results for “{term}”", suggestion to check spelling or browse Explore.
- Result count announced with `aria-live="polite"`; `aria-busy` during fetch.

### 8.8 Movie details

- Backdrop band 60 vh (min 420, max 640) with top scrim for navbar legibility.
- Poster 180 px (mobile) / 220 px (tablet) / 280 px (desktop), overlapping the backdrop by 40–96 px.
- Info column: micro-label (release status), title, tagline (italic, muted, 1 line), meta row,
  genre chips (outline pills, 12 px), action row (`Trailer`, watchlist with label on desktop).
- Overview: 15–16 px, max 68ch, "Read more" toggle after 5 lines on mobile.
- Sections in order: Overview → Cast → Trailer → Where to watch → Similar. Each with a micro-label
  header and 40–56 px separation.
- Cast: horizontal list of 12, 72 px circular portraits (fallback = initials), name 13 px, character
  12 px muted, 1-line clamp.
- Providers: grouped rows (Stream / Free / Rent / Buy), each provider a 56 px chip with `w92` logo +
  name; footer line "Availability data provided by JustWatch" + link to the TMDB watch page.
- Similar: same carousel as home, `poster` variant.

### 8.9 Watchlist

- Header: title, count ("12 titles"), "Clear all" text button (danger on hover, confirm dialog).
- Grid of `detailed` cards, newest first; each card's watchlist button removes it (instant, with
  undo toast or inline undo row).
- Empty state: `Bookmark` icon in a 64 px surface circle, "Your watchlist is empty", one sentence,
  primary CTA "Explore movies".
- No pagination — the list is local and capped at 500.

### 8.10 Footer

- Three columns on desktop, stacked on mobile: brand + tagline, navigation, about/attribution.
- TMDB logo (24 px, muted, hover white) + required sentence, and the JustWatch line.
- 13 px `--muted-foreground`, top hairline, 48–64 px vertical padding.
- No newsletter, no social icons beyond GitHub/portfolio links.

### 8.11 State components

| Component | Spec |
|-----------|------|
| `LoadingSkeleton` | `--surface-2` blocks, 1.6 s opacity pulse (disabled under reduced motion), no spinners for content areas |
| `ErrorState` | `AlertTriangle` in `--danger/10` circle, headline, one-line cause, `Retry` outline button |
| `EmptyState` | neutral icon, headline, sentence, optional primary action |
| Inline error (row) | compact 1-line message + "Retry" text button, height reserved to avoid shift |
| Offline banner | full-width strip under navbar, `--surface-2`, `WifiOff` icon, "You're offline — showing saved data" |

---

## 9. Motion

| Interaction | Duration | Easing | Property |
|-------------|----------|--------|----------|
| Hover (card, button, link) | 120–160 ms | `ease-out` | transform, color, border |
| Focus ring | 0 ms | — | instant (accessibility) |
| Chips / filters | 180 ms | `ease-out` | background, border |
| Dialog / sheet | 220 ms | `cubic-bezier(0.22,1,0.36,1)` | opacity, translateY(8px) |
| Hero crossfade | 700 ms | `ease-in-out` | opacity |
| Route content | 160 ms | `ease-out` | opacity (no slide) |
| Skeleton pulse | 1600 ms | `ease-in-out` | opacity 0.5→1 |

Global rule:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Never: parallax, bouncing springs, rotating loaders for page content, auto-playing trailers, hover
video previews, marquee text, animated gradients.

---

## 10. Interaction states

| State | Treatment |
|-------|-----------|
| Default | surface + hairline border |
| Hover | surface-3 fill or border-strong; text → foreground |
| Active/pressed | 1 px translateY, no color change |
| Focus-visible | 2 px `--ring` ring, 2 px offset, always visible on dark |
| Selected (chip/filter) | `--primary-soft` fill, `--primary` text, `--primary/40` border |
| Disabled | 40% opacity, `cursor-not-allowed`, no hover |
| Loading | skeleton or inline progress bar; button shows a 16 px spinner and keeps its width |
| Error | `--danger` icon + text, retry action |
| Saved | filled bookmark, ice color, label changes to "Remove from watchlist" |

---

## 11. Accessibility requirements

- WCAG 2.2 AA. Contrast verified for every token pair used for text.
- Landmarks and one `h1` per page; heading levels never skip.
- Skip link ("Skip to content") as the first focusable element.
- All interactive elements reachable by Tab in visual order; no positive `tabindex`.
- Cards: link with an accessible name including title and year; the save button has its own label.
- Carousels: labeled region, keyboard scroll, arrows with `aria-label`, disabled state announced.
- Dialogs: `role="dialog"`, `aria-modal`, labelled by title, focus trap, `Esc`, focus restore.
- Search: labeled input, `role="search"`, live result count, `aria-busy` during fetch.
- Images: meaningful alt for posters ("Poster for {title}"); decorative backdrops `alt=""`.
- Motion: respect `prefers-reduced-motion`; no flashing content.
- Touch targets ≥ 44×44 px (visual size may be 32 px with padding).
- Zoom to 200% without loss of content; no fixed-height text containers that clip.
- Never rely on color alone for saved/selected/error states.

---

## 12. Content and tone

- Sentence case for UI labels; uppercase only for micro-labels.
- Concise, neutral, no exclamation marks: "Added to watchlist", "No results for “dune”".
- Empty states explain the next action, not the absence ("Save movies to build your list.").
- Errors say what happened and what to do: "Couldn't load trending movies. Retry."
- Numbers: `8.4` (one decimal), `2h 14m`, `12 Mar 2021`, `$ 165.2M` only if ever shown.
- Never fabricate metadata; if TMDB lacks it, omit the field rather than inventing a value.

---

## 13. Anti-patterns (explicitly banned)

- Neon glows, colored drop shadows, gradient text, glassmorphism panels everywhere.
- Purple/pink "AI product" palettes or rainbow genre colors.
- Dashboard cards with big numbers and charts.
- Emoji as icons; inconsistent icon stroke weights (Lucide only, 1.75–2 px).
- Autoplaying trailers with sound; hover video previews.
- Centered marketing hero with a giant headline and two buttons.
- More than two font families; text below 13 px; low-contrast gray-on-gray.
- Animating layout properties (width/height/top/left) instead of transform/opacity.
- Rounded-3xl everything; 24 px radius on small chips.
- Spinners replacing whole page sections when a skeleton would preserve layout.
- Fake "recommended for you" language — the data is trending/popular/similar, say so.

---

## 14. QA checklist (per screen)

- [ ] 360, 390, 768, 1024, 1440, 1920 px — no overflow, no clipped text, nav usable.
- [ ] Keyboard-only pass: skip link, nav, filters, cards, carousel arrows, dialog, save buttons.
- [ ] Focus ring visible on every interactive element, including on posters.
- [ ] Loading → content transition causes no layout shift.
- [ ] Empty, error, offline, and missing-image states all render sensibly.
- [ ] Long titles (60+ chars), missing overview, missing poster, 0 votes all handled.
- [ ] Contrast check on muted text over `--surface` and over imagery scrims.
- [ ] Reduced-motion mode: no crossfades, no pulse, no hover transforms.
- [ ] Screen reader spot check: card name, save state, result count, dialog title.
- [ ] Images: correct `srcSet`/`sizes`, lazy except hero, no `original` in lists.
- [ ] Attribution present (TMDB footer, JustWatch in providers).
