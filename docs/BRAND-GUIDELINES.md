# Kolamba Brand Guidelines

**Version:** 1.0
**Date:** 2026-01-20

---

## 1. Brand Overview

**Kolamba** - The Jewish Culture Club

A marketplace platform connecting Israeli/Jewish artists with Jewish communities worldwide.

---

## 2. Logo

### Primary Logo
The Kolamba logo consists of:
1. **Icon:** Stylized arch/gateway symbol (representing connection, doorway to culture)
2. **Wordmark:** "KOLAMBA" in decorative serif typography
3. **Tagline:** "THE JEWISH CULTURE CLUB"
4. **Underline:** Gradient line beneath the tagline

### Logo Variants

| Variant | Usage |
|---------|-------|
| Full color (gradient) | Primary use on light backgrounds |
| Black | Monochrome applications |
| White | Dark backgrounds |
| Icon only | Favicon, app icon, small spaces |

### Logo Files
```
/design/
├── kolamba1.pdf  - Icon variants and black/white logos
└── kolamba2.pdf  - Color logos and palette
```

### Clear Space
Maintain minimum clear space around logo equal to the height of the "O" in KOLAMBA.

---

## 3. Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Teal** | `#53b9cc` | rgb(83, 185, 204) | Primary brand color, CTAs, links |
| **Rose** | `#ca7283` | rgb(202, 114, 131) | Secondary accent, highlights |

### Neutral Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Light Gray** | `#e8e9ea` | rgb(232, 233, 234) | Backgrounds, cards |
| **Black** | `#000000` | rgb(0, 0, 0) | Text, headings |

### Brand Gradient
```css
background: linear-gradient(to right, #ca7283, #53b9cc);
```

### Extended Palette (Tailwind CSS)

```javascript
// Primary Teal Scale
primary: {
  50: "#e8f7fa",
  100: "#d1eff5",
  200: "#a3dfeb",
  300: "#75cfe1",
  400: "#53b9cc", // Main
  500: "#53b9cc",
  600: "#4294a3",
  700: "#326f7a",
  800: "#214a52",
  900: "#112529",
}

// Secondary Rose Scale
secondary: {
  50: "#fdf2f4",
  100: "#fbe5e9",
  200: "#f7ccd3",
  300: "#e9a5b0",
  400: "#ca7283", // Main
  500: "#ca7283",
  600: "#a25b69",
  700: "#79444f",
  800: "#512d34",
  900: "#28171a",
}

// Neutral Gray Scale
neutral: {
  50: "#f8f9f9",
  100: "#e8e9ea", // Main
  200: "#d1d3d5",
  300: "#babdc0",
  400: "#a3a7ab",
  500: "#8c9196",
  600: "#6e7378",
  700: "#53575a",
  800: "#373a3c",
  900: "#1c1d1e",
}
```

---

## 4. Typography

### Fonts

| Type | Font Family | Usage |
|------|-------------|-------|
| **Display** | Georgia, Times New Roman, serif | Logo, hero headings |
| **Body (English)** | Inter, Open Sans, sans-serif | Body text, UI elements |
| **Body (Hebrew)** | Open Sans Hebrew, Rubik, sans-serif | Hebrew content |

### Type Scale

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Heading Styles

```css
/* Logo style */
.logo {
  font-family: Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Section headings */
h1 { font-size: 2.25rem; font-weight: 700; }
h2 { font-size: 1.875rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }
```

---

## 5. UI Components

### Buttons

```css
/* Primary Button (Teal) */
.btn-primary {
  background-color: #53b9cc;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn-primary:hover {
  background-color: #4294a3;
}

/* Secondary Button (Rose) */
.btn-secondary {
  background-color: #ca7283;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn-secondary:hover {
  background-color: #a25b69;
}

/* Outline Button */
.btn-outline {
  border: 2px solid #53b9cc;
  color: #53b9cc;
  background: transparent;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #53b9cc; /* Optional accent */
}
```

### Brand Underline

```css
/* Gradient underline like in logo */
.brand-underline::after {
  content: "";
  display: block;
  height: 2px;
  background: linear-gradient(to right, #ca7283, #53b9cc);
  margin-top: 0.25rem;
}
```

---

## 6. Iconography

### Logo Icon
The arch/gateway symbol represents:
- Connection between artists and communities
- Doorway to Jewish culture
- Welcoming entrance

### UI Icons
Use [Lucide Icons](https://lucide.dev/) for consistency:
- Stroke width: 2px
- Size: 24px (default), 20px (small), 32px (large)
- Color: Match text color or brand colors

---

## 7. Imagery

### Photography Style
- Warm, authentic moments
- Focus on human connection
- Jewish cultural events and performances
- Diverse communities

### Image Treatment
- Slight warm tone overlay
- Avoid harsh filters
- Natural lighting preferred

---

## 8. Voice & Tone

### Brand Voice
- **Warm:** Welcoming and friendly
- **Professional:** Trustworthy and reliable
- **Cultural:** Respectful of Jewish heritage
- **Modern:** Contemporary and accessible

### Language
- Primary: Hebrew (RTL)
- Secondary: English (LTR)
- Support bilingual content throughout

---

## 9. Application Examples

### Header
```
[Icon]  KOLAMBA               [Search] [Categories] [Artists] [Login]
        ────────────
```

### Hero Section
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              KOLAMBA                            │
│         ─────────────────                       │
│      THE JEWISH CULTURE CLUB                    │
│                                                 │
│    מקשרים אמנים ישראלים לקהילות יהודיות         │
│                                                 │
│    [Search artists...]           [Search]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Footer
```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Icon] KOLAMBA                                 │
│         THE JEWISH CULTURE CLUB                 │
│                                                 │
│  © 2026 Kolamba. All rights reserved.          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 10. CSS Variables Reference

```css
:root {
  /* Brand Colors */
  --brand-teal: #53b9cc;
  --brand-rose: #ca7283;
  --brand-gray: #e8e9ea;
  --brand-black: #000000;

  /* Gradients */
  --brand-gradient: linear-gradient(to right, #ca7283, #53b9cc);
  --brand-gradient-vertical: linear-gradient(to bottom, #ca7283, #53b9cc);

  /* Semantic Colors */
  --color-primary: var(--brand-teal);
  --color-secondary: var(--brand-rose);
  --color-background: var(--brand-gray);
  --color-text: var(--brand-black);

  /* Status Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-01-20
**Prepared by:** Drishti Consulting
