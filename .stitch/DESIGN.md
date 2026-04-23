# Sacred — Design System

## Overview

Sacred is a premium spiritual-tech app that transforms phone distraction into prayer. The design language must reflect this mission: it should feel **calm, intentional, and reverent** — not gamified or playful. Every pixel should reinforce the product's core promise of depth and focus.

**North star aesthetic**: The overlap of Apple's precision, Calm app's serenity, and the quiet confidence of a beautifully crafted leather journal.

---

## 1. Color Palette

All color tokens live in `constants/colors.ts`. No raw hex strings in component files.

### Core Palette

| Token | Hex | Role |
|---|---|---|
| `background` | `#080808` | App background — near-black with a cool undertone |
| `surface` | `#141414` | Default card / list container background |
| `surfaceElevated` | `#1E1E1E` | Elevated cards, modals, selected states |
| `border` | `#282828` | Standard borders, separators |
| `borderSubtle` | `#1C1C1C` | Hairline dividers inside grouped content |

### Text

| Token | Hex | Role |
|---|---|---|
| `text.primary` | `#F5F5F5` | Primary readable content |
| `text.secondary` | `#A3A3A3` | Supporting metadata, subtitles |
| `text.tertiary` | `#525252` | Placeholders, disabled, muted labels |

### Brand Accent (Teal — Single Primary)

Sacred has **one** primary brand color. It is used for:
- Primary CTAs
- Active tab indicator
- Progress fills
- Links and interactive text

| Token | Hex | Role |
|---|---|---|
| `accent.primary` | `#0D9488` | Brand teal — primary interactive color |
| `accent.primaryLight` | `rgba(13,148,136,0.15)` | Tinted backgrounds behind teal icons |

### Semantic Accents (Use Sparingly)

These are reserved for specific semantic meanings only. Do not use for decoration.

| Token | Hex | Semantic use |
|---|---|---|
| `accent.amber` | `#D97706` | Streak / gamification only (flame icon, streak count) |
| `accent.success` | `#10B981` | Completion / prayer done states |
| `accent.destructive` | `#EF4444` | Delete actions |

### Gradients (Modal / Immersive Screens Only)

Gradients are reserved exclusively for full-screen immersive experiences: the Welcome splash, the Intercept modal, the Active Prayer screen, and the Prayer Complete screen. **Do not use gradients on tab screens or list cards.**

| Token | Colors | Usage |
|---|---|---|
| `gradient.brand` | `['#0D9488', '#0F766E', '#134E4A']` | Welcome splash, Sign In header |
| `gradient.intercept` | `['#12091F', '#1E1035', '#2D1760']` | Intercept modal background |
| `gradient.activePrayer` | `['#080808', '#111827', '#0F2922']` | Active prayer screen |
| `gradient.complete` | `['#080808', '#0F2922', '#134E4A']` | Prayer complete screen |
| `gradient.premium` | `['#14082B', '#1E1035', '#2D1760']` | Upgrade / paywall screen |

---

## 2. Typography

### Scale

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display` | 48px | 700 | 52px | -0.5 | Hero numbers (timer, big stat) |
| `pageTitle` | 32px | 700 | 38px | -0.3 | Tab screen headings |
| `sectionHeading` | 20px | 600 | 26px | -0.2 | Section titles |
| `body` | 16px | 400 | 24px | 0 | Standard readable text |
| `bodyMedium` | 16px | 500 | 24px | 0 | Emphasized body, row labels |
| `bodySmall` | 14px | 400 | 20px | 0 | Subtitles, excerpts |
| `caption` | 12px | 500 | 16px | 0.3 | ALL-CAPS section headers, tags |
| `micro` | 11px | 400 | 14px | 0.2 | Legal, version, trailing metadata |

### Rules

- **No mixed weight families.** Use weight to create hierarchy, not typefaces.
- Section group labels (e.g., "PAUSE SETTINGS") use `caption` style: 12px, weight 500, `#525252`, `letterSpacing: 0.5`, `textTransform: 'uppercase'`.
- Tab bar labels: 11px, weight 500.
- Italic is permitted only on scripture text in the Active Prayer and Intercept screens.

---

## 3. Spacing Scale

Use only values from this scale. No arbitrary padding values.

| Token | Value | Common usage |
|---|---|---|
| `space.xs` | 4px | Icon gap, badge padding |
| `space.sm` | 8px | Tight inner padding |
| `space.md` | 12px | Icon margin, inter-item gap |
| `space.base` | 16px | Standard padding, row height padding |
| `space.lg` | 20px | Card internal padding |
| `space.xl` | 24px | Screen horizontal margin |
| `space.2xl` | 32px | Section gap |
| `space.3xl` | 48px | Hero section padding |
| `space.4xl` | 64px | Full-screen vertical centering |

**Screen horizontal padding**: always `24px` (`space.xl`).
**Section vertical gap**: always `32px` (`space.2xl`).
**Card internal padding**: always `20px` (`space.lg`).

---

## 4. Border Radius Scale

| Token | Value | Usage |
|---|---|---|
| `radius.sm` | 8px | Pills, filter chips, small tags |
| `radius.md` | 12px | Input fields, icon containers, small buttons |
| `radius.lg` | 16px | Cards, list groups, prayer cards |
| `radius.xl` | 24px | Large gradient cards (journey chart, hero card) |
| `radius.full` | 9999px | Circular avatars, pill buttons |

**Consistency rule**: All cards use `radius.lg` (16px). All icon containers use `radius.md` (12px). All filter chips use `radius.sm` (8px). No mixing.

---

## 5. Iconography

### Library

**Ionicons exclusively.** No emojis used as interface icons anywhere in the application. The only acceptable non-Ionicons glyphs are the `✝` cross on the Welcome splash (treated as a logotype element, not a UI icon) and Unicode characters inside the active prayer scripture text.

### Forbidden patterns

- `🙏` as the prayer icon → use `Ionicons name="hand-left-outline"` or `"leaf-outline"`
- `👑` as the premium icon → use `Ionicons name="diamond-outline"`
- `∞` as a benefit icon → use `Ionicons name="infinite-outline"`
- `⏱️`, `📊`, `🎨`, `💜` in benefit lists → use matching Ionicons
- `✓` as the completion checkmark → use `Ionicons name="checkmark"` inside a styled container
- `→` as a navigation arrow → use `Ionicons name="arrow-forward"`
- Emoji in the apps grid on Value screen → use placeholder rectangle blocks with opacity

### Icon Sizes

| Context | Size |
|---|---|
| Tab bar | 24px |
| Header action button | 22px |
| Row / list item | 20px |
| Icon container (action card) | 24px |
| Empty state | 56px |
| Premium/modal hero | 32px |

### Icon Container

All icon containers (colored background behind a small icon) must use this pattern:
- Size: 44×44
- Border radius: `radius.md` (12px)
- Background: semantic tint at 12–15% opacity
- Icon color: the full-saturation accent color

---

## 6. Component Specifications

### 6.1 Card (Surface)

```
backgroundColor: surface (#141414)
borderRadius: radius.lg (16px)
padding: space.lg (20px)
borderWidth: 1
borderColor: border (#282828)
```

No gradient on standard cards. Gradient only on the hero "Today's Prayers" card and the Journey week chart.

### 6.2 List Group (Settings-style)

```
backgroundColor: surface (#141414)
borderRadius: radius.lg (16px)
borderWidth: 1
borderColor: border (#282828)
overflow: hidden
```

Row height: minimum 52px. Separator: 1px `borderSubtle` (`#1C1C1C`), inset 50px from left.

### 6.3 Filter Chip / Pill

```
height: 34px
paddingHorizontal: 14px
borderRadius: radius.sm (8px)
backgroundColor (inactive): surface (#141414)
borderWidth: 1
borderColor: border (#282828)
text: 13px, weight 500, text.secondary
```

Active state:
```
backgroundColor: accent.primary (#0D9488)
borderColor: transparent
text color: #FFFFFF
```

### 6.4 Primary Button

```
height: 56px
borderRadius: radius.full
backgroundColor: #FFFFFF
text: 17px, weight 600, color: #080808
```

Gradient variant (immersive screens only):
```
gradient: gradient.brand
text color: #FFFFFF
```

### 6.5 Input Field

```
height: 56px
backgroundColor: surface (#141414)
borderRadius: radius.md (12px)
borderWidth: 1
borderColor: border (#282828)
paddingHorizontal: 16px
text: 16px, color: text.primary
```

Focus state: `borderColor: accent.primary`

### 6.6 Tab Bar

```
backgroundColor: #080808
borderTopWidth: 1
borderTopColor: #1C1C1C
height: 84px
paddingBottom: 24px
paddingTop: 10px
```

Active icon/label color: `#FFFFFF`. Inactive: `text.tertiary` (`#525252`). No tint on active tab icon background.

### 6.7 Section Header Label

```
fontSize: 12px
fontWeight: '500'
color: text.tertiary (#525252)
letterSpacing: 0.5
textTransform: 'uppercase'
marginBottom: 8px
paddingHorizontal: 4px
```

### 6.8 FAB (Floating Action Button)

```
width: 56px
height: 56px
borderRadius: radius.full
backgroundColor: accent.primary (#0D9488)
bottom: 100px
right: 24px
```

No gradient on FAB. Shadow: `shadowColor: accent.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: {0, 4}`.

---

## 7. Screen-by-Screen Rules

### Welcome Splash (`(onboarding)/index.tsx`)
- Full-screen `gradient.brand`
- Breathing circles: OK as is (subtle, elegant)
- Cross `✝` logotype: keep, center-aligned, white, inside a frosted container
- "Sacred" title: 48px bold white
- Bottom section on `background` color, contains CTA

### Sign In / Sign Up
- Header uses `gradient.brand`, rounded bottom corners (`radius.xl`)
- Body on flat `background`
- Social buttons: full `surface` + `border` style (no gradients)
- No playful icons; use standard Ionicons for Google/Apple

### Value Screen (`(onboarding)/value.tsx`)
- Replace emoji grid inside phone illustration with simple rounded rectangles at varying opacities (no emojis)
- Arrow button: replace `→` text with `Ionicons name="arrow-forward"`

### Apps Screen (`(onboarding)/apps.tsx`)
- Review: ensure app icons use real icon images or clean placeholder squares

### Frequency Screen (`(onboarding)/frequency.tsx`)
- Review and ensure consistent card/selection styling

### Home Tab
- Header: "Sacred" wordmark (32px bold) + icon buttons (44×44 circle, surface BG)
- Hero card: gradient (`gradient.brand`) allowed here — this is the one gradient on a tab screen
- Quick action cards: `surface` background, NO gradient. Replace `flower-outline` with `leaf-outline` for "Pray Now"
- "Today's Pauses" list items: minimal row style, no excessive padding

### Prayers Tab
- Prayer cards: **replace multi-gradient rainbow rotation** with a single consistent style:
  - `surface` background with `border`
  - Left accent bar in `accent.primary` (4px wide, full height, `radius.sm` left corners)
  - Or use a single subtle teal gradient if gradient is needed for differentiation
- Filter chips: per spec above
- Favorite: `Ionicons name="heart"` / `"heart-outline"` — already correct, keep

### Journey Tab
- Week chart card: single `gradient.brand` allowed
- Stat cards: flat `surface` — no per-stat accent gradients on the icon containers
- Streak icon: `flame` (Ionicons) in amber — semantic use, allowed
- Trophy icon: `trophy-outline` (Ionicons) — OK
- Time icon: `time-outline` → replace with `hourglass-outline` for clearer meaning
- Prayer count icon: replace `flower-outline` with `leaf-outline`
- Apps icon: `apps-outline` — OK

### Settings Tab
- List groups: per spec 6.2
- Icon colors: all `text.secondary` (#A3A3A3) for neutral icons; `accent.amber` only for "Upgrade" row
- Remove `resetButton` in production (demo-only element)

### Intercept Modal
- Full-screen `gradient.intercept` — keep
- Remove emoji fallback for app icon (`interceptedApp.icon`) — use a generic `square-outline` Ionicons placeholder if no image
- Scripture text: italic, centered — keep
- Breathing orb: keep (purposeful ambient animation)

### Active Prayer Modal
- Full-screen `gradient.activePrayer` — keep
- Replace `🙏` emoji icon with `Ionicons name="leaf-outline"` (40px) inside teal-tinted circle
- Timer: 64px weight 200 — keep (excellent, minimalist)
- Progress dots: keep

### Prayer Complete Modal
- Full-screen `gradient.complete` — keep
- Replace `✓` text with `Ionicons name="checkmark"` (52px, bold) inside teal circle
- Stats display: keep

### Upgrade / Paywall Modal
- Full-screen `gradient.premium` — keep
- Replace `👑` emoji with `Ionicons name="diamond-outline"` (36px) inside amber gradient square
- Replace all benefit emoji icons (`∞`, `⏱️`, `📊`, `🎨`, `💜`) with appropriate Ionicons:
  - Unlimited → `infinite-outline`
  - Duration → `timer-outline`
  - Insights → `bar-chart-outline`
  - Themes → `color-palette-outline`
  - Mission → `heart-outline`
- Pricing cards: current structure is good, refine border radius to `radius.lg`

---

## 8. Animation & Motion

- **Breathing circles** on Welcome and Intercept: keep — they are purposeful and calming
- **Spring animations** on Button press: keep
- **FadeIn** on scripture change in Active Prayer: keep
- **Checkmark bounce** on Prayer Complete: keep

**Rules**:
- Duration: slow transitions 400–600ms, fast feedback 150–200ms
- Easing: `Easing.inOut(Easing.ease)` for all ambient/ambient animations
- No bouncy spring animations in list views or settings

---

## 9. What to Remove / Never Use

| Banned element | Replace with |
|---|---|
| Any emoji as a UI icon | Ionicons equivalent |
| Random gradient on prayer list cards | Flat surface + accent bar |
| `borderRadius: 50` (random pill on waiting container) | `radius.full` |
| `borderRadius: 22` (icon button) | `radius.full` |
| Inconsistent `borderRadius: 20` on action cards | `radius.lg` (16) |
| Hardcoded hex colors outside `constants/colors.ts` | Token from colors.ts |
| `rgba(255,255,255,0.2)` tint on social buttons | `surface` + `border` |
| `flower-outline` for prayer/pause | `leaf-outline` |
| `SECTIONTITLE` in all-caps with wrong weight | Section header per 6.7 spec |
| Demo reset button in production UI | Remove entirely from final UI |
