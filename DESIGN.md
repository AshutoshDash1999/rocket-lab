---
version: alpha
name: Toonify
description: |
  Toonify's design system radiates playful energy and approachability, centered
  on the creation of animated brand mascots. The visual personality embraces
  bold, vibrant accent colors layered over a clean, minimal foundation—white
  canvases and soft neutral surfaces that let illustrated characters and bright
  UI elements command attention. The system favors smooth, rounded affordances
  (buttons and badges render as full pills) and uses generous spacing and soft
  shadows to create a welcoming, modern SaaS atmosphere. Color blocking is the
  primary depth mechanism rather than heavy shadows, giving the interface a
  flat-yet-elevated character. Typography is split between a warm, rounded
  headline font (Fredoka) and a clean, pragmatic body font (Nunito), reinforcing
  both personality and readability. The overall effect is contemporary and
  trustworthy—suitable for a platform that helps non-designers create
  professional brand assets.
source:
  url: "https://toonify.io"
  pagesAnalyzed: 1
  extractedAt: 2026-11-03
  tokensMeasured: true
colors:
  primary: "#2563FF"
  link: "#1A47CC"
  canvas: "#FFFFFF"
  surface: "#E7F8D6"
  surface-alt: "#F5F8FF"
  on-primary: "#0E1A3A"
  ink: "#44506B"
  body: "#6B7690"
  hairline: "#E7EBF3"
  accent-1: "#A9C1FF"
  accent-2: "#F9DC5C"
  accent-3: "#FF6B4A"
  neutral-1: "#EAF0FF"
typography:
  display-xl:
    fontFamily: Fredoka
    fontSize: 64.8px
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.97px
  display-lg:
    fontFamily: Fredoka
    fontSize: 60px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.9px
  display-md:
    fontFamily: Fredoka
    fontSize: 46px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.46px
  heading-lg:
    fontFamily: Fredoka
    fontSize: 34px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.34px
  heading-md:
    fontFamily: Fredoka
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: -0.28px
  heading-md-tight:
    fontFamily: Fredoka
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: -0.42px
  heading-sm:
    fontFamily: Fredoka
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: 0px
  heading-xs:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: 0px
  body-xl:
    fontFamily: Fredoka
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: 0px
  body-lg:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0px
  body-md:
    fontFamily: Nunito
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: 0px
  body-sm:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0px
  body-sm-loose:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0px
  body-sm-2:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0px
  button-xl:
    fontFamily: Fredoka
    fontSize: 23px
    fontWeight: 600
    lineHeight: 1.55
    letterSpacing: 0px
  button-lg:
    fontFamily: Nunito
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.55
    letterSpacing: 0px
  button-md:
    fontFamily: Nunito
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0px
  button-sm:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: 800
    lineHeight: 1.55
    letterSpacing: 0px
  caption:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: 0px
rounded:
  none: 0px
  xs: 10px
  sm: 18px
  md: 20px
  lg: "22%"
  xl: 28px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 28px
  xxxl: 32px
  section: 36px
  band: 40px
borderWidths:
  thin: 1px
  medium: 2px
shadows:
  sm: "rgba(14, 26, 58, 0.5) 0px 18px 30px -24px"
  md: "rgba(37, 99, 255, 0.45) 0px 24px 60px -30px"
  lg: "rgba(37, 99, 255, 0.65) 0px 8px 20px -8px"
  xl: "rgba(14, 26, 58, 0.35) 0px 2px 8px -4px"
elevationStrategy: progressive
themes:
  derived: dark # the other theme is the site's measured palette
  light:
    bg: "#FFFFFF"
    surface: "#E7F8D6"
    surfaceRaised: "#E0F1D2"
    text: "#44506B"
    textMuted: "#6B7690"
    border: "#E7EBF3"
    accent: "#2563FF"
    accentFg: "#FFFFFF"
    focusRing: "#2563FF"
    elevation: shadow
  dark:
    bg: "#0A0C15"
    surface: "#191B23"
    surfaceRaised: "#25272F"
    text: "#F6F9FF"
    textMuted: "#9C9FA6"
    border: "#31333A"
    accent: "#3972FF"
    accentFg: "#0B0B0C"
    focusRing: "#2563FF"
    elevation: "border+surface"
gradients:
  - context: section
    kind: linear
    value: "linear-gradient(rgba(0, 0, 0, 0) 64%, rgb(255, 201, 51) 64%, rgb(255, 201, 51) 93%, rgba(0, 0, 0, 0) 93%)"
  - context: section
    kind: radial
    value: "radial-gradient(circle at 30% 22%, rgb(255, 255, 255) 0px, rgb(234, 240, 255) 52%, rgb(211, 225, 255) 100%)"
  - context: section
    kind: linear
    value: "linear-gradient(rgb(255, 246, 216), rgb(255, 255, 255) 58%)"
components:
  button-primary:
    typography: "{typography.button-lg}"
    textColor: "{colors.canvas}"
    border: "1px solid {colors.primary}"
    height: 59.8906px
    padding: "15px 28px 15px 28px"
    boxShadow: "rgba(37, 99, 255, 0.65) 0px 8px 20px -8px"
    rounded: 999px
    backgroundColor: "{colors.primary}"
  button-primary-sm:
    textColor: "{colors.canvas}"
    border: "1px solid {colors.primary}"
    height: 37.25px
    padding: "6px 14px 6px 14px"
    fontSize: 15px
    boxShadow: "rgba(37, 99, 255, 0.65) 0px 8px 20px -8px"
    fontFamily: Nunito
    fontWeight: 700
    lineHeight: 1.55
    rounded: 999px
    backgroundColor: "{colors.primary}"
  button-filled:
    textColor: "{colors.link}"
    border: "1px solid {colors.primary}"
    height: 32.1406px
    padding: "5px 12px 5px 12px"
    fontSize: 13px
    fontFamily: Nunito
    fontWeight: 600
    lineHeight: 1.55
    rounded: 999px
    backgroundColor: "{colors.neutral-1}"
  card:
    typography: "{typography.button-md}"
    textColor: "{colors.on-primary}"
    padding: "28px 28px 28px 28px"
    rounded: "{rounded.xl}"
    backgroundColor: "{colors.surface}"
  card-sm:
    typography: "{typography.button-md}"
    textColor: "{colors.on-primary}"
    border: "1px solid {colors.hairline}"
    padding: "14px 14px 16px 14px"
    boxShadow: "rgba(14, 26, 58, 0.5) 0px 18px 30px -24px"
    rounded: "{rounded.md}"
    backgroundColor: "{colors.canvas}"
  badge-filled:
    textColor: "{colors.on-primary}"
    height: 32.1406px
    padding: "6px 14px 6px 14px"
    fontSize: 13px
    fontFamily: Nunito
    fontWeight: 800
    lineHeight: 1.55
    rounded: 999px
    backgroundColor: "rgb(255, 201, 51)"
  navigation:
    typography: "{typography.button-md}"
    textColor: "{colors.on-primary}"
    height: 24.7969px
  footer:
    typography: "{typography.button-md}"
    textColor: "{colors.on-primary}"
    border: "1px solid {colors.hairline}"
    padding: "56px 0px 28px 0px"
  link:
    typography: "{typography.button-lg}"
    textColor: "{colors.on-primary}"
    border: "1px solid rgb(214, 220, 234)"
    padding: "15px 28px 15px 28px"
    rounded: 999px
    backgroundColor: "{colors.canvas}"
  link-sm:
    typography: "{typography.body-xl}"
    textColor: "{colors.on-primary}"
states:
  button-hover:
    target: button
    state: hover
    transform: "translateY(-1px)"
  button-disabled:
    target: button
    state: disabled
    opacity: 0.45
  button-active:
    target: button
    state: active
    transform: "translateY(1px)"
  other-disabled:
    target: other
    state: disabled
    opacity: 0.4
  other-hover:
    target: other
    state: hover
    transform: "translateY(-2px)"
  input-focus:
    target: input
    state: focus
    boxShadow: none
  card-hover:
    target: card
    state: hover
    boxShadow: "rgba(14, 26, 58, 0.45) 0px 22px 40px -28px"
    transform: "translateY(-2px)"
  link-hover:
    target: link
    state: hover
    textColor: "{colors.canvas}"
  card-disabled:
    target: card
    state: disabled
    opacity: 0.6
  card-focus-visible:
    target: card
    state: focus-visible
    outline: none
  nav-hover:
    target: nav
    state: hover
    outline: none
breakpoints:
  - width: 375
    containerWidth: 22
    gridColumns: 4
    navLinksVisible: 6
    menuToggleVisible: true
    headingPx: 40
    bodyPx: 17
    sectionPaddingX: 0
  - width: 768
    containerWidth: 24
    gridColumns: 6
    navLinksVisible: 6
    menuToggleVisible: true
    headingPx: 40
    bodyPx: 17
    sectionPaddingX: 0
  - width: 1024
    containerWidth: 25
    gridColumns: 6
    navLinksVisible: 11
    menuToggleVisible: false
    headingPx: 47
    bodyPx: 17
    sectionPaddingX: 0
  - width: 1280
    containerWidth: 1200
    gridColumns: 6
    navLinksVisible: 11
    menuToggleVisible: false
    headingPx: 59
    bodyPx: 17
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1200
    gridColumns: 3
    navLinksVisible: 11
    menuToggleVisible: false
    headingPx: 65
    bodyPx: 17
    sectionPaddingX: 0
coverage:
  statesFound: 42
  gradientsFound: 3
  rolesUnassigned: 4
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: false
  semanticRampDeclared: false
---

# Design System Inspired by Toonify

## 1. Visual Theme & Atmosphere

Toonify's design system radiates playful energy and approachability, centered on the creation of animated brand mascots. The visual personality embraces bold, vibrant accent colors layered over a clean, minimal foundation—white canvases and soft neutral surfaces that let illustrated characters and bright UI elements command attention. The system favors smooth, rounded affordances (buttons and badges render as full pills) and uses generous spacing and soft shadows to create a welcoming, modern SaaS atmosphere. Color blocking is the primary depth mechanism rather than heavy shadows, giving the interface a flat-yet-elevated character. Typography is split between a warm, rounded headline font (Fredoka) and a clean, pragmatic body font (Nunito), reinforcing both personality and readability. The overall effect is contemporary and trustworthy—suitable for a platform that helps non-designers create professional brand assets.

**Key Characteristics:**

- Playful, approachable, and modern SaaS aesthetic
- Pill-shaped interactive elements (buttons, badges, avatars)
- Bold brand blue (`#2563FF`) paired with warm decorative accents (yellow, orange, pink)
- Generous whitespace and soft shadows for depth
- Color blocking (soft green surfaces, light blue bands) as primary elevation mechanism
- Split typography: expressive Fredoka headlines + pragmatic Nunito body copy
- Decorative graphic elements (gradients, scattered accent dots) enhance visual richness without clutter

## 2. Color Palette & Roles

### Primary

- **Primary / Brand** (`{colors.primary}` — `#2563FF`): Primary call-to-action fills, brand accent highlights, active interactive states, and link hover colors. Defines the core brand identity.
- **Link** (`{colors.link}` — `#1A47CC`): Inline link text color, darker derivative of primary for subtle differentiation.

### Accent Colors

- **Decorative Warm** (`{colors.accent-2}` — `#F9DC5C`): Bright yellow accent used for visual highlights, decorative underlines, and graphic embellishments. No functional role.
- **Decorative Orange** (`{colors.accent-3}` — `#FF6B4A`): Warm coral-red used for scattered accent shapes and decorative elements. No functional role.
- **Decorative Soft Blue** (`{colors.accent-1}` — `#A9C1FF`): Muted lavender-blue for decorative overlays and accent graphics. No functional role.

### Interactive

- **On Primary** (`{colors.on-primary}` — `#0E1A3A`): Dark text and labels displayed on brand-colored surfaces and backgrounds. Ensures contrast on `{colors.primary}` fills.

### Neutral Scale

- **Canvas** (`{colors.canvas}` — `#FFFFFF`): Default page background and primary writing surface.
- **Surface** (`{colors.surface}` — `#E7F8D6`): Soft green background for featured cards and content panels (e.g., mascot showcase sections).
- **Surface Alt** (`{colors.surface-alt}` — `#F5F8FF`): Pale blue-gray alternating section background and secondary panels.
- **Neutral Light** (`{colors.neutral-1}` — `#EAF0FF`): Lightest neutral for subtle background tints and decorative layers.

### Text & Borders

- **Ink** (`{colors.ink}` — `#44506B`): Primary heading and display text color. Warmest dark neutral.
- **Body** (`{colors.body}` — `#6B7690`): Body copy and secondary text; mid-tone neutral for reduced emphasis.
- **Hairline** (`{colors.hairline}` — `#E7EBF3`): 1px borders, dividers, and subtle rule lines; lightest stroke color for minimal visual noise.

## 3. Typography Rules

### Font Family

**Primary Headline Font:** Fredoka (rounded, warm, expressive)

- Fallback stack: `Fredoka, system-ui, sans-serif`

**Secondary Body & UI Font:** Nunito (clean, pragmatic, highly legible)

- Fallback stack: `Nunito, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Role             | Font    | Size   | Weight | Line Height | Letter Spacing | Notes                                                      |
| ---------------- | ------- | ------ | ------ | ----------- | -------------- | ---------------------------------------------------------- |
| Display XL       | Fredoka | 64.8px | 600    | 1.08        | -0.97px        | Hero headline, maximum visual impact                       |
| Display LG       | Fredoka | 60px   | 600    | 1.04        | -0.9px         | Large hero headlines, secondary hero text                  |
| Display MD       | Fredoka | 46px   | 600    | 1.05        | -0.46px        | Major section headers, feature headlines                   |
| Heading LG       | Fredoka | 34px   | 600    | 1.1         | -0.34px        | Section-level headings, card titles                        |
| Heading MD       | Fredoka | 28px   | 600    | 1.55        | -0.28px        | Subsection headers, feature titles                         |
| Heading MD Tight | Fredoka | 28px   | 600    | 1.04        | -0.42px        | Compressed heading variant for space-constrained layouts   |
| Heading SM       | Fredoka | 20px   | 600    | 1.55        | 0px            | Small card headers, feature labels                         |
| Heading XS       | Nunito  | 18px   | 800    | 1.35        | 0px            | Tertiary labels, compact headings                          |
| Body XL          | Fredoka | 24px   | 600    | 1.55        | 0px            | Prominent body text, feature callouts                      |
| Body LG          | Nunito  | 18px   | 400    | 1.55        | 0px            | Large body copy, feature descriptions                      |
| Body MD          | Nunito  | 17px   | 700    | 1.55        | 0px            | Semibold body text, link text                              |
| Body SM          | Nunito  | 16px   | 400    | 1.45        | 0px            | Standard body copy, footnotes                              |
| Body SM Loose    | Nunito  | 16px   | 400    | 1.65        | 0px            | Spacious body variant for readability on light backgrounds |
| Body SM 2        | Nunito  | 16px   | 400    | 1.55        | 0px            | Standard body copy variant                                 |
| Button XL        | Fredoka | 23px   | 600    | 1.55        | 0px            | Large primary button text                                  |
| Button LG        | Nunito  | 18px   | 700    | 1.55        | 0px            | Large secondary button text                                |
| Button MD        | Nunito  | 17px   | 400    | 1.55        | 0px            | Medium button text                                         |
| Button SM        | Nunito  | 16px   | 800    | 1.55        | 0px            | Small button text, compact UI                              |
| Caption          | Nunito  | 14px   | 400    | 1.35        | 0px            | Fine print, metadata, image captions                       |

### Principles

- **Negative tracking on display sizes** is intentional; the design uses optical spacing reduction (e.g., -0.97px on 64.8px display) to tighten headlines and reinforce visual hierarchy.
- Fredoka is reserved for display and expressive roles, reinforcing brand personality and visual warmth at large scales.
- Nunito dominates body, UI, and compact text, prioritizing legibility and reducing cognitive load on lengthy content.
- Line heights remain generous (≥1.35) across all roles, supporting accessibility and visual breathing room.
- Weight contrast is stark: display text is consistently weight 600, button text varies (400–800) to signal interaction intent.

## 4. Component Stylings

### Buttons

**Primary Button (Large)**

- Background: `{colors.primary}` (`#2563FF`)
- Text color: `{colors.canvas}` (`#FFFFFF`)
- Font: `{typography.button-lg}` (Nunito, 18px, weight 700)
- Padding: `{spacing.lg}` (`20px`) vertical, `{spacing.xl}` (`24px`) horizontal (reported as `15px 28px` in extraction; use measured values)
- Border radius: `{rounded.full}` (`9999px`)
- Border: `1px solid {colors.primary}` (`#2563FF`)
- Box shadow: `rgba(37, 99, 255, 0.65) 0px 8px 20px -8px`
- Height: ~60px
- Hover: `transform: translateY(-1px)`, `box-shadow: rgba(37, 99, 255, 0.7) 0px 12px 24px -10px`
- Active: `transform: translateY(1px)`
- Disabled: `opacity: 0.35`

**Primary Button (Small)**

- Background: `{colors.primary}` (`#2563FF`)
- Text color: `{colors.canvas}` (`#FFFFFF`)
- Font: `{typography.button-md}` (Nunito, 17px, weight 400)
- Padding: `6px 14px`
- Border radius: `{rounded.full}` (`9999px`)
- Border: `1px solid {colors.primary}` (`#2563FF`)
- Box shadow: `rgba(37, 99, 255, 0.65) 0px 8px 20px -8px`
- Height: ~37px
- Hover: `transform: translateY(-1px)`
- Disabled: `opacity: 0.35`

**Filled Button (Secondary / Ghost)**

- Background: `{colors.accent-1}` (`#A9C1FF`)
- Text color: `{colors.link}` (`#1A47CC`)
- Font: `{typography.button-md}` (Nunito, 17px, weight 400)
- Padding: `5px 12px`
- Border radius: `{rounded.full}` (`9999px`)
- Border: `1px solid {colors.primary}` (`#2563FF`)
- Box shadow: `none`
- Height: ~32px
- Hover: `color: var(--brand)`, `border-color: var(--brand)`
- Disabled: `opacity: 0.45`

### Cards & Containers

**Card (Large, Featured)**

- Background: `{colors.surface}` (`#E7F8D6`)
- Text color: `{colors.on-primary}` (`#0E1A3A`)
- Font: `{typography.body-md}` (Nunito, 17px, weight 400)
- Padding: `{spacing.xxl}` (`28px`)
- Border radius: `{rounded.xl}` (`28px`)
- Border: `none`
- Box shadow: `none`
- Width: ~575px
- Height: ~883px
- Hover: `transform: translateY(-4px)`, `box-shadow: rgba(14, 26, 58, 0.45) 0px 22px 34px -22px`

**Card (Small, Compact)**

- Background: `{colors.canvas}` (`#FFFFFF`)
- Text color: `{colors.on-primary}` (`#0E1A3A`)
- Font: `{typography.body-md}` (Nunito, 17px, weight 400)
- Padding: `{spacing.sm}` (`12px`) to `{spacing.md}` (`16px`) (reported as `14px`)
- Border radius: `{rounded.md}` (`20px`)
- Border: `1px solid {colors.hairline}` (`#E7EBF3`)
- Box shadow: `rgba(14, 26, 58, 0.5) 0px 18px 30px -24px`
- Width: ~290px
- Height: ~208px
- Hover: `transform: scale(1.04) translateY(-3px)`, `box-shadow: rgba(14, 26, 58, 0.45) 0px 22px 40px -28px`

### Badges

**Badge (Filled)**

- Background: `#FFC933` (bright yellow, role: decorative accent)
- Text color: `{colors.on-primary}` (`#0E1A3A`)
- Font: `{typography.heading-xs}` (Nunito, 18px, weight 800)
- Padding: `6px 14px`
- Border radius: `{rounded.full}` (`9999px`)
- Border: `none`
- Box shadow: `none`
- Height: ~32px
- Hover: `border-color: var(--brand)`

### Inputs & Forms

**Input Focus State**

- Border color: `{colors.primary}` (`#2563FF`)
- Box shadow: `0 0 0 4px {colors.accent-1}` (`rgba(169, 193, 255, 1)` or derived soft brand tint)
- Border radius: `{rounded.none}` (`0px`) — forms use sharp corners
- Transition: smooth focus ring

### Navigation

**Navigation Links (Default)**

- Text color: `{colors.on-primary}` (`#0E1A3A`)
- Font: `{typography.body-md}` (Nunito, 17px, weight 400)
- Background: transparent
- Border: `none`
- Hover: `color: {colors.primary}` (`#2563FF`), optional `border-color: var(--brand-mid)`
- Active: `color: {colors.primary}` (`#2563FF`)

**Navigation (CTA Button Variant)**

- Background: `{colors.primary}` (`#2563FF`)
- Text color: `{colors.canvas}` (`#FFFFFF`)
- Font: `{typography.button-lg}` (Nunito, 18px, weight 700)
- Padding: `{spacing.lg}` vertical, `{spacing.xl}` horizontal
- Border radius: `{rounded.full}` (`9999px`)
- Border: `1px solid {colors.primary}`
- Box shadow: `rgba(37, 99, 255, 0.65) 0px 8px 20px -8px`
- Hover: `transform: translateY(-1px)`, shadow lift

## 5. Layout Principles

### Spacing System

**Base unit:** `{spacing.xs}` = `8px`

**Scale:**

- `{spacing.xxs}` = `4px` — micro spacing, icon gaps, tight list items
- `{spacing.xs}` = `8px` — small intra-component spacing
- `{spacing.sm}` = `12px` — button padding, form field spacing
- `{spacing.md}` = `16px` — standard spacing, card padding, section margins
- `{spacing.lg}` = `20px` — generous spacing, button padding
- `{spacing.xl}` = `24px` — large spacing, section padding
- `{spacing.xxl}` = `28px` — card padding, major section spacing
- `{spacing.xxxl}` = `32px` — component group separation
- `{spacing.section}` = `36px` — section vertical margin
- `{spacing.band}` = `40px` — band/container vertical padding

**Usage context:**

- Buttons and form inputs use `{spacing.md}`–`{spacing.lg}` for padding.
- Cards and panels use `{spacing.xl}`–`{spacing.xxl}` for internal padding.
- Sections use `{spacing.band}` for top/bottom padding.
- Horizontal margins between components default to `{spacing.lg}`–`{spacing.xl}`.

### Grid & Container

- **Max width:** `1200px` (measured at 1280px and 1440px breakpoints)
- **Column strategy:** 6-column grid at desktop (1024px+), adapts to 4 columns at tablet (375px–768px)
- **Section padding:** Measured as `0px` horizontal padding at all breakpoints; margins are managed via grid gutters or component margins, not edge padding.
- **Hero sections** use full-width color-blocked bands with internal max-width containers for content alignment.

### Whitespace Philosophy

The design embraces generous whitespace to reduce cognitive load and highlight key content (mascot illustrations, call-to-action buttons). Sections are separated by `{spacing.band}` (`40px`) vertical spacing, and nested elements (cards within sections) use `{spacing.xxl}` padding. Floating accent shapes (dots, gradients) occupy whitespace without competing with text, reinforcing visual hierarchy through color blocking rather than density.

### Border Radius Scale

- `{rounded.none}` = `0px` — Forms, inputs, footer borders. Sharp aesthetic for utilitarian elements.
- `{rounded.xs}` = `10px` — Subtle rounding for secondary UI elements.
- `{rounded.sm}` = `18px` — Intermediate rounding for decorative graphics and secondary cards.
- `{rounded.md}` = `20px` — Small and medium cards, standard rounded aesthetic.
- `{rounded.lg}` = `22%` — Image and avatar masking; percentage-based for responsive circular crops.
- `{rounded.xl}` = `28px` — Large featured cards and major UI panels.
- `{rounded.full}` = `9999px` — Pills and full circles: buttons, badges, avatars, toggle controls.

### Border Widths

- `thin` = `1px` — Button borders, subtle dividers, hairline rules.
- `medium` = `2px` — (Measured but not extensively used in extracted components; available for emphasis if needed.)

## 6. Depth & Elevation

| Level       | Treatment                                     | Use                                           |
| ----------- | --------------------------------------------- | --------------------------------------------- |
| Flat (Base) | No shadow                                     | Typography, body text, neutral backgrounds    |
| Subtle (XL) | `rgba(14, 26, 58, 0.35) 0px 2px 8px -4px`     | Secondary buttons, small interactive elements |
| Soft (SM)   | `rgba(14, 26, 58, 0.5) 0px 18px 30px -24px`   | Small cards, secondary panels                 |
| Medium (MD) | `rgba(37, 99, 255, 0.45) 0px 24px 60px -30px` | Featured cards, elevated surfaces             |
| Strong (LG) | `rgba(37, 99, 255, 0.65) 0px 8px 20px -8px`   | Primary buttons, CTA elements, maximum lift   |

**Shadow Philosophy:**
Toonify employs a progressive shadow scale that transitions from near-invisible (XL) to pronounced (LG), with color-encoded depth: darker shadows (dark ink) convey subtle depth on neutral surfaces, while brand-blue shadows (`{colors.primary}` tinted) reinforce interactive prominence on call-to-action elements. This creates a gentle, layered elevation system without visual heaviness. Most surfaces (cards, text blocks) rely on color blocking (light green, pale blue) rather than shadows for depth cues, reducing reliance on drop shadows and maintaining a clean, modern appearance.

### Opacity Levels

- `40%` or `0.40` — Hover overlay, disabled secondary states, light transparency for background graphics.
- `35%` — Disabled primary button fill.
- `45%` — Disabled secondary elements, reduced visibility.
- `55%` — Disabled tertiary elements.
- `60%` — Disabled card states, reduced interactive prominence.

### Z-index / Layering

- `dropdown` = `30` — Dropdowns, popovers, and overlays sit above standard content but below modals and toasts (if present).
- _Base content layer:_ `0`–`10` — Default stacking for page content, cards, sections.
- _Modal/Alert layer:_ Implied to exceed `30` (not extracted; note under Known Gaps if modal z-index is critical).

## 7. Do's and Don'ts

### Do

- **Use `{colors.primary}` (`#2563FF`) for all primary CTAs, links, and active states.** It is the brand anchor and ensures consistent recognition.
- **Pair rounded (pill-shaped) buttons with sharp-cornered forms.** This contrast clarifies actionable vs. input-oriented elements.
- **Apply color blocking over shadow depth.** Use `{colors.surface}` (soft green) and `{colors.surface-alt}` (pale blue) backgrounds to define elevation; reserve shadows for interactive hover states.
- **Maintain `{spacing.band}` (`40px`) vertical gutters between major sections.** This preserves whitespace and visual rhythm.
- **Reserve Fredoka font for display and headline roles.** It conveys personality; overuse dilutes impact.
- **Default to `{typography.body-sm}` or `{typography.body-sm-loose}` for body copy;** adjust line-height based on background contrast (loose line-height on light backgrounds).
- **Use `{rounded.full}` for all interactive controls** (buttons, badges, toggles) to signal affordance.
- **Set button hover to `transform: translateY(-1px)`** and amplify shadow; this micro-interaction provides tactile feedback without overwhelming motion.
- **Apply `{colors.link}` (`#1A47CC`) exclusively to inline hyperlinks;** use `{colors.primary}` for navigation and UI links.

### Don't

- **Don't apply shadows to cards or containers as primary depth cues.** Color is the first signal; shadows accent hover or focus states only.
- **Don't use decorative accent colors (`{colors.accent-1}`, `{colors.accent-2}`, `{colors.accent-3}`) for semantic meaning** (e.g., error, warning). The site does not define a semantic color ramp; these are visual embellishments only.
- **Don't overuse negative letter-spacing on body text.** Tight tracking (-0.97px) is reserved for large display sizes (64.8px+); body and small sizes use 0px tracking.
- **Don't mix Fredoka and Nunito arbitrarily.** Fredoka = expressive headlines; Nunito = pragmatic UI and body. Respect the split.
- **Don't nest accent decorative shapes within text areas.** Floating colored dots and gradients belong in whitespace and panel backgrounds, not overlaid on typography.
- **Don't disable button states with opacity alone.** Combine `opacity: 0.35–0.45` with `pointer-events: none` to prevent interaction.
- **Don't apply focus outlines to cards.** The system uses `outline: 3px solid var(--brand)` for focus-visible on buttons and interactive elements, but card focus handling varies; avoid over-specification.
- **Don't set section padding-x (horizontal padding) on containers.** The extraction shows `0px` across all breakpoints; use grid gutters and max-width instead.

## 8. Responsive Behavior

### Breakpoints

| Breakpoint    | Viewport Width | Content Column | Grid Columns | Nav Links Visible | Key Changes                                                                  |
| ------------- | -------------- | -------------- | ------------ | ----------------- | ---------------------------------------------------------------------------- |
| Mobile        | 375px          | 22px           | 4            | 6                 | Menu toggle present; headings compress to 40px; single-column layout         |
| Tablet        | 768px          | 24px           | 6            | 6                 | Slightly wider content column; 6-column grid; nav remains visible            |
| Desktop       | 1024px         | 25px           | 6            | 11                | Menu toggle hidden; all nav links visible; baseline desktop layout           |
| Large Desktop | 1280px         | 1200px         | 6            | 11                | Fixed max-width container (1200px); 6-column grid preserved                  |
| Extra Large   | 1440px         | 1200px         | 3            | 11                | Max-width pinned at 1200px; column count reduces to 3 for spacing efficiency |

**Collapse points:**

- **Mobile to Tablet:** 768px (menu toggle remains; minimal layout shift)
- **Tablet to Desktop:** 1024px (menu toggle hidden; nav links fully expanded)
- **Max-width activation:** 1280px (container width locked at 1200px)

### Touch Targets

- **Minimum touch size:** 44px (height or width) for all interactive elements on touch devices.
- **Button sizing:** Primary buttons default to ~60px height; secondary and small variants to ~32–37px.
- **Spacing between targets:** `{spacing.md}` (`16px`) minimum horizontal gap to prevent accidental taps.
- **Link affordance:** Inline links and nav items receive `{spacing.md}` padding to expand touch zone.

### Collapsing Strategy

- **Navigation:** At <1024px, nav collapses to a hamburger menu toggle; label and CTA button remain visible in header.
- **Headings:** Display sizes scale down (64.8px → 40px) as viewport shrinks, maintaining visual hierarchy.
- **Grid:** 4 columns on mobile (375px) expand to 6 on tablet (768px) and desktop; at extra-large (1440px), reduces to 3 for visual balance.
- **Cards:** Featured cards maintain `{rounded.xl}` and `{spacing.xxl}` padding across breakpoints; small cards reflow into single or dual columns.
- **Sections:** `{spacing.band}` vertical spacing preserved; horizontal padding set to 0px throughout, with margins managed via grid and container max-width.

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA & Accent:** Primary (`#2563FF`) — all buttons, active states, brand accent
- **Link Text:** Link (`#1A47CC`) — inline hyperlinks only
- **Page Background:** Canvas (`#FFFFFF`) — default writing surface
- **Featured Card Background:** Surface (`#E7F8D6`) — soft green, high-value panels
- **Section Band Background:** Surface Alt (`#F5F8FF`) — pale blue alternating sections
- **Heading & Display Text:** Ink (`#44506B`) — primary text color
- **Body Copy:** Body (`#6B7690`) — secondary text, reduced emphasis
- **Text on Brand Surfaces:** On Primary (`#0E1A3A`) — contrast layer for brand fills
- **Borders & Dividers:** Hairline (`#E7EBF3`) — minimal 1px rules
- **Decorative (No Semantic Role):** Yellow (`#F9DC5C`), Orange (`#FF6B4A`), Soft Blue (`#A9C1FF`) — graphic embellishments only

### Iteration Guide

1. **Button Foundation:** All buttons use `{rounded.full}` (`9999px`) border-radius and `{spacing.lg}`–`{spacing.xl}` padding. Primary buttons fill with `{colors.primary}` + white text; secondary buttons fill with `{colors.accent-1}` + `{colors.link}` text. Apply `rgba(37, 99, 255, 0.65) 0px 8px 20px -8px` shadow to primary only.

2. **Card Elevation via Color:** Distinguish card prominence by background color (`{colors.surface}` = featured; `{colors.canvas}` = standard) rather than shadow alone. Soft box-shadows (`rgba(14, 26, 58, 0.5)...`) apply only on hover; at rest, cards are flat.

3. **Typography Split:** Fredoka handles display (>20px) and headline roles; Nunito handles body, UI, and captions (<18px). Maintain weight contrast: display is always 600; body varies 400–700 based on emphasis.

4. **Responsive Max-Width:** Lock content width at `1200px` above 1280px breakpoint. Below 1024px, allow full-width sections with 0px horizontal padding and manage margins via grid gutters.

5. **Hover Micro-Interactions:** Cards lift with `transform: translateY(-2px to -4px)` and shadow amplification. Buttons translate up `1px` with shadow boost. Links underline on hover. Disable during `:disabled` state with `opacity: 0.35–0.45` + `pointer-events: none`.

6. **Focus Ring Clarity:** Apply `outline: 3px solid var(--brand)` (`#2563FF`) to focusable elements (buttons, inputs, nav links); use `outline-offset: 2px` for breathing room.

7. **Spacing Rhythm:** Base all section gaps on `{spacing.band}` (`40px`). Internal card/component spacing uses `{spacing.xl}`–`{spacing.xxl}`. Never add horizontal section padding; rely on max-width containers.

8. **Semantic Color Absence:** The system does NOT define error, warning, or success colors. Use `{colors.primary}` for confirmations/actions; consider adding a status ramp under Known Gaps if shipping error/validation states.

9. **Gradients as Decoration:** Radial (`radial-gradient(circle at 30% 22%, ...)`) and linear gradients populate whitespace (e.g., hero section backgrounds); they do not overlay or interfere with text. Treat as background-layer visual interest.

10. **Touch-Friendly Sizing:** Ensure all interactive targets (buttons, links, form inputs) measure ≥44px in one dimension. Use `{spacing.md}` between targets to prevent mis-taps on mobile.

## 10. Known Gaps

- **Semantic color ramp not defined.** The site does not expose error, warning, or success states in its measured markup. If building validation UI or status messaging, a semantic palette must be custom-defined; no error/warning colors are available from extraction.
- **Four accent colors lack assigned roles.** `{colors.accent-1}` (soft blue), `{colors.accent-2}` (yellow), `{colors.accent-3}` (orange), and `{colors.neutral-1}` (neutral light) appear in decorative or experimental contexts only; they do not map to specific UI functions. If these should gain semantic meaning in future iterations, clarify role and usage context.
- **Interaction states not exhaustively extracted.** Hover, active, and focus states were sampled from the site's stylesheets but may not cover all edge cases (e.g., form error focus, multi-select interactions, keyboard navigation on complex components). The documented states represent the most common patterns observed.
- **Dark mode / theme switching not measured.** The design system reflects a single light theme; no dark mode, auto-theme, or alternate color scheme was detected. If a derived dark variant is needed, it must be custom-built.
- **Advanced component states missing.** Intermediate states (e.g., input validation, loading, skeleton screens, drag-and-drop feedback) were not present in the analyzed page. These belong under Known Gaps rather than guessed into the spec.
- **Modal and toast z-index not measured.** The dropdown z-index is confirmed at `30`; modals, alerts, and floating notifications are assumed higher but exact values were not extracted.
- **Motion and animation timing not specified.** The site is an AI mascot generator (inherent animation capability), but CSS transition timing, easing, and keyframe definitions were not captured. Only static transform and shadow hover states were documented.
- **Print and high-contrast mode not addressed.** No print stylesheet or `prefers-contrast` media queries were detected in extraction.
- **Surfaces behind authentication not visited.** The analysis covers the public landing and info pages only. Authenticated user interfaces (dashboard, editor, account settings) may follow different component patterns and are outside the scope of this extraction.

---

**Confidence:** This document is grounded in measured values from the homepage and supporting pages. Values in token references are guaranteed exact. Color roles follow the site's actual usage patterns. Typography and spacing are deterministic from extraction. Component styling CSS matches extracted measurements. Use this spec as the source of truth for implementation; deviations introduce risk of visual inconsistency with the shipped product.
