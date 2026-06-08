# Design System: Rpszz.shop

This document details the visual theme, tokens, and components for Rpszz.shop, built with Vanilla CSS and OKLCH color spaces.

## Theme & Visual Direction

A high-contrast, premium dark mode tailored around deep dark blue (navy), white, red, and black. 
It uses sharp, clean borders (no soft wide shadows) and subtle electric blue glow effects to evoke a premium street-apparel vibe.

---

## Design Tokens

### Color Palette (OKLCH)

```css
--bg: oklch(0.10 0.015 262);           /* Deep dark blue-black background */
--surface: oklch(0.14 0.025 262);      /* Surface color for cards and panels */
--border: oklch(0.22 0.03 262);        /* Border lines (sleek 1px style) */
--ink: oklch(0.98 0.005 262);          /* Pure off-white high-contrast body text */
--muted: oklch(0.74 0.01 262);         /* Dimmed text color for descriptions */
--primary: oklch(0.55 0.18 262.4);     /* Deep cobalt electric blue seed */
--accent: oklch(0.58 0.22 25);         /* Vibrant deep red accent */
```

### Typography

- **Display Headings**: `Outfit` (sans-serif)
  - Letter spacing: `-0.03em` for display H1s.
  - Sizing: Responsive fluid scaling using `clamp()` (Max hero ceiling ≤ 6rem).
- **Body Text**: `Inter` (sans-serif)
  - Max line length: `65-75ch` to guarantee optimal readability.
  - Text-wrap: `pretty` for paragraphs, `balance` for headings.

### Layout & Borders

- **Border Radius**: Capped at `12px` (`--radius-lg`) for cards to maintain a crisp look. Inputs and buttons use `8px` (`--radius-md`).
- **Card Shadows**: Do not mix wide shadows with 1px borders. We use clean solid borders (`1px solid var(--border)`).
- **Z-Index System**:
  - Dropdowns: 1000
  - Sticky Headers: 1100
  - Modals: 1300
  - Tooltips: 1500

---

## Core Components

### 1. Product Showcase Cards
- Aspect ratio: 1:1 image container with smooth scale transformation on hover.
- Badges: Availability status placed on top right or top left.
- Buy Action: High contrast Red Button for "Chat to Buy", electric blue or gray for queues.

### 2. Status Tracking Timeline
- Continuous left rule with steps marking:
  - **Preparing**: Order registered.
  - **Shipped**: Parcel with courier, displaying tracking number.
  - **Delivered**: Parcel arrived.
- Active states glow using `--primary` color; past steps highlight with `--accent` (Red).

### 3. Responsive Navigation
- Sticky position, 70px height.
- Dynamic transparent background overlay (`oklch(0.10 0.015 262 / 0.85)`) with a `12px` backdrop blur.
