# DESIGN.md — Ramalin Tarot Interactive WebApp
STATUS: LOCKED
ARCHITECTURE: Mobile-First 100dvh Adaptive Mystical Narrative Flow

## 1. Anti-Glare Optical Palette (Enchanted Altar Theme)
Anti-Halation Guard: Banned pure #FFFFFF and pure #000000.
- Canvas Deep Matte: Obsidian Twilight `#150F21`
- Surface Altar / Containers: Solid Night Plum `#1F1528` (Elevated `#2A1B36`)
- Border Token: 1px solid `rgba(255, 213, 140, 0.18)` (Matte gold hairline)
- Text Primary: Soft Candlelight `#F7EEDD` (Max 88% luminance)
- Text Muted: Muted Sage `#9B98A6`
- Primary Accent: Warm Amber Gold `#E5A93C` (Text & Highlights)
- Secondary Tone: Mystic Plum `#5E3360`
- CTA Primary: Solid Ember Gold `#D99026` (Active: `#BF7B19`)
- Error / Alert: Sunset Coral `#E05353`

## 2. Typography & Storytelling Rhythm
Max 2 font families:
- Primary Display & Headings: `Newsreader` / `Cinzel` (Editorial Serif, weights 600-700)
- Primary UI & Narrative Story: `Plus Jakarta Sans` (Clean Humanist Sans, 400-500)
- Telemetry & Numbers: `font-mono tabular-nums` for counters [1/3]

## 3. Mobile Ergonomics & Safe-Area
- Screen Container: Full-width responsive (`w-full min-h-[100dvh] max-w-md mx-auto relative`). Full bleed on small mobile displays, no excessive horizontal side voids.
- Touch Targets: Minimum `min-h-[48px] min-w-[48px]` for all interactive buttons and inputs.
- Safe Area Padding: Anchored bottom actions with `pb-[max(1rem,env(safe-area-inset-bottom))]`.
- Spread Layout: 3 cards in an aligned mystical triad with no bureaucratic text labels ("masa lalu / kini / depan" removed from card faces).

## 4. State-to-Component Binding & User Flow
- State 0 (INPUT_FORM):
  - Large transparent witch character (192-220px) seated at altar.
  - Altar input form: Name (max 40 char) and consult topic (max 140 char).
  - Dense grouped layout: Form fields directly connected to CTA button (`min-h-[52px]`).
- State 1 (SHUFFLING & CARD_LOCKING):
  - Card carousel / fan with responsive cards.
  - Touch card or tap Ambil Kartu -> Triggers witch evil grin / pointing animation (`anim_3_pick.webp`).
- State 2 (REVEALING_CARDS):
  - Sequential 3D card flips (Past -> Present -> Future).
- State 3 (CARDS_REVEALED_HOLD):
  - Mandatory Hold Gate: 3 revealed cards stay fully visible in center.
  - Witch dialog reacts to revealed spread (`anim_4_read.webp`).
  - Prominent CTA button: [ Baca Penjelasannya ] (`min-h-[52px]`).
- State 4 (STORY_READING_VIEW):
  - Cohesive scrollable narrative scroll (NO disconnected tabs, NO spreadsheet layout).
  - Story flows naturally: Opening hook -> The Seed (Past) -> The Current (Present) -> The Dawn (Future) -> Wisdom Guidance.
  - Zero robotic repetitions of "pertanyaan".

## 5. Audio & Performance Budget
- Background Music: Open-source mystical ambient BGM starts automatically on user touch/input. Zero audio toggle clutter buttons in the header.
- Animations: Pure CSS 3D transforms (`rotate-y-180`, `perspective: 1000px`), lightweight WebP frames.
- Memory: Respect Armbian 250MB per-worker budget.

## 6. Project-Specific Forbidden Classes (Regex Blacklist)
- BANNED: `bg-gradient-to-*` across entire cards or backgrounds (mushy AI slop).
- BANNED: `shadow-2xl`, `shadow-xl`, `drop-shadow-*` (uncalibrated muddy shadows).
- BANNED: `rounded-3xl` and `rounded-full` on cards/drawers (use crisp `rounded-2xl` or `rounded-xl`).
- BANNED: `backdrop-blur-2xl`, `backdrop-blur-xl` simultaneous glassmorphism.
- BANNED: Excessive `✦` characters and `Sparkles` icon clutter.
- BANNED: Disconnected tabbed reading navigation (`Past`, `Present`, `Future`, `Advice` tabs).
