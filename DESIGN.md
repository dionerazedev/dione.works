---
name: Dione Raze Portfolio
description: A quiet monochrome field index for Dione's products, systems, notes, and technical work.
colors:
  light-background: "#ffffff"
  light-foreground: "#0a0a0a"
  light-gray-50: "#fafafa"
  light-gray-100: "#f5f5f5"
  light-gray-200: "#e9e9e9"
  light-gray-300: "#d4d4d4"
  light-gray-400: "#a3a3a3"
  light-gray-500: "#737373"
  dark-background: "#0c0c0f"
  dark-foreground: "#f4f4f5"
  dark-gray-50: "#18181b"
  dark-gray-100: "#1e1e22"
  dark-gray-200: "#2a2a30"
  dark-gray-300: "#3a3a42"
  dark-gray-400: "#8a8a92"
  dark-gray-500: "#a0a0a8"
typography:
  display:
    fontFamily: "Geist Pixel, Geist Mono, monospace"
    fontSize: "clamp(2.35rem, 6vw, 3rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  article:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  input: "6px"
  small: "8px"
  medium: "12px"
  large: "16px"
spacing:
  hairline: "1px"
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "56px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.light-foreground}"
    textColor: "{colors.light-background}"
    rounded: "{rounded.input}"
    padding: "10px 14px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.light-foreground}"
    rounded: "{rounded.input}"
    padding: "10px 14px"
    height: "44px"
---

# Design System: Dione Raze Portfolio

## Overview

**Creative North Star: “The Personal Field Index”**

The portfolio reads like a precisely maintained technical zine: a permanent personal index at the left, a narrow evidence column, and Dione’s real work presented through images, metadata, short notes, and direct routes. The work leads; interface chrome recedes.

The system is strictly monochrome. Typography, inversion, rules, whitespace, and one dissolving halftone portrait treatment create hierarchy. Dark mode is a semantic remapping of the same composition.

**Key Characteristics:**
- Fixed 14rem personal sidebar and narrow editorial content
- Compact portrait-led first viewport
- Hairline dividers and modest type scale
- Pixel display details and mono technical metadata
- Honest loading, empty, offline, and unavailable states

## Colors

Pure white/true black and near-black/off-white themes share one semantic gray ramp.

### Neutral
- **Background** (`#ffffff` / `#0c0c0f`): page and primary canvas.
- **Foreground** (`#0a0a0a` / `#f4f4f5`): body copy and inverted controls.
- **Gray 50–100**: rare subtle fills.
- **Gray 200** (`#e9e9e9` / `#2a2a30`): all hairline rules.
- **Gray 300** (`#d4d4d4` / `#3a3a42`): strong borders and scrollbars.
- **Gray 400** (`#a3a3a3` / `#8a8a92`): decorative texture and non-text marks only in light mode; dark tertiary labels may use the dark value where it passes.
- **Gray 500** (`#737373` / `#a0a0a8`): secondary readable text.

All light-theme text, including 8–10px metadata, resolves to Gray 500 or darker so the nominal faint ramp never creates inaccessible gray-on-white copy.

**The Monochrome Rule.** No yellow, brand accent, gradient text, glow, or color-only status. Emphasis uses inversion, weight, arrows, and halftone texture.

## Typography

**Display Font:** Geist Pixel Square with Geist Mono fallback  
**Body Font:** Geist with system UI fallback  
**Label/Mono Font:** Geist Mono  
**Long-form Font:** Source Serif 4 with Georgia fallback

**Character:** Compact and personal. Sans carries conversation, mono carries navigation and metadata, pixel marks display details, and serif is reserved for article reading.

### Hierarchy
- **Display** (400, up to 3rem, 1): page titles, the name, and statistic values.
- **Headline** (600, up to 2.25rem, 1.08): section and project titles.
- **Title** (600, 15–20px, 1.2): navigation, rows, and card titles.
- **Body** (400, 15px, 1.65): explanatory copy at a 65–75ch measure.
- **Article** (400, 17px, 1.75): published and draft article bodies only.
- **Label** (500, 9–11px, uppercase, 0.08em): dates, tags, status, and controls.

**The Compact Register Rule.** Hierarchy comes from font role and spacing, never oversized agency typography.

## Layout

At 1024px and above, a fixed 14rem sidebar occupies the full viewport and scrolls internally; content clears the rail. Reading routes use a 42rem maximum width, while project grids may reach 56rem. Sections use 56–96px vertical intervals and 1px rules. Below 1024px, a sticky top bar opens a full-screen menu, content becomes one column, and horizontal padding becomes 16px. Controls remain at least 44px on touch layouts.

## Elevation & Depth

The system is flat by default. Rules, crop, inversion, and whitespace establish depth. Soft low-alpha shadows appear only on dialogs or a discrete interactive media surface; dark mode relies on borders.

**The Flat Evidence Rule.** Prefer a divided row to a card; use a contained surface only when media or an interaction needs a clear boundary.

## Shapes

Rules are 1px. Inputs use 6px corners, small controls 8px, media and compact panels 12px, and dialogs 16px. Pills are reserved for small filters and state labels. Portrait and presence avatars may be circular.

## Components

### Buttons
- **Shape:** 6–8px radius with a 44px minimum touch height.
- **Primary:** foreground fill with background text.
- **Hover / Focus:** small tonal shift or arrow translation; focus uses a 2px foreground outline.
- **Secondary:** transparent with one neutral border.

### Chips
- **Style:** gray-300 hairline, uppercase mono at 9px, fully rounded.
- **State:** selection inverts foreground and background.

### Cards / Containers
- **Corner Style:** 12–16px only for real media or interactive objects.
- **Background:** transparent or gray-50.
- **Shadow Strategy:** none at rest; soft ground-contact shadow on interactive hover where useful.
- **Border:** one gray-200 hairline.

### Inputs / Fields
- **Style:** gray-50 fill, gray-200 border, 6px radius, 13px text.
- **Focus:** foreground outline and stronger border.
- **Error / Disabled:** always include explanatory text; opacity is never the only state cue.

### Navigation
- Desktop groups use thin separators. Active items use a leading arrow and foreground text. Mobile uses a sticky top bar and a focus-trapped full-screen overlay. External links always carry `↗`.

### Halftone Portrait
- The black-and-white portrait dissolves into a single masked dot field. Halftone appears in no more than two places per route and never sits behind important body copy.

## Do's and Don'ts

### Do:
- **Do** let verified projects, status disclosures, and real imagery lead.
- **Do** keep all required states honest and accessible.
- **Do** use the exact semantic monochrome ramp in both themes.
- **Do** preserve project routes, profile links, résumé, assistant, and keyboard commands.

### Don't:
- **Don't** use yellow or any bright accent color.
- **Don't** use oversized hero typography, glassmorphism, gradients, or fake terminal decoration.
- **Don't** fabricate posts, viewers, chat messages, clients, metrics, or experience.
- **Don't** turn every section into repeated equal-size SaaS cards.
