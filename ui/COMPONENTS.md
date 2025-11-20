# Key-Kingdom UI Components

This file summarizes how to use the design tokens in `TOKENS.css` for basic components.

---

## Buttons

### Primary Button

**Usage:** Main CTA.

**Styles:**

- Background: `var(--sl-primary-inner)`
- Text: `var(--sl-text)`
- Border: none
- Border-radius: `var(--sl-radius-md)`
- Padding: `12px 20px`
- Font-family: `var(--sl-font-display)`
- Box-shadow: `var(--sl-shadow-strong)`

**Hover:**
- Background: `var(--sl-primary)`
- Slightly stronger glow

**Active:**
- `transform: scale(0.97);`

---

### Secondary Button

**Usage:** Secondary actions.

**Styles:**

- Background: `var(--sl-gray-1)`
- Border: `1.5px solid var(--sl-primary)`
- Text: `var(--sl-primary)`
- Border-radius: `var(--sl-radius-md)`
- Padding: `10px 18px`
- Shadow: `var(--sl-shadow-soft)`

---

## Cards

**Usage:** Content containers for product info, sections, etc.

**Styles:**

- Background: `#0A0F14`
- Border: `1px solid var(--sl-gray-1)`
- Border-radius: `var(--sl-radius-lg)`
- Padding: `var(--sl-space-lg)`
- Shadow: subtle cyan glow (opacity ~5–10%)

Spacing between cards: `var(--sl-space-lg)` to `var(--sl-space-xl)`.

---

## Inputs

**Base:**

- Background: `var(--sl-gray-1)`
- Border: `1px solid var(--sl-gray-2)`
- Text: `var(--sl-text)`
- Border-radius: `10px`
- Padding: `12px 14px`
- Font-family: `var(--sl-font-body)`

**Focus:**

- Border-color: `var(--sl-primary)`
- Box-shadow: `0 0 10px rgba(31,176,255,0.4), 0 0 20px rgba(31,176,255,0.2);`

---

## Layout

- Dark mode only (background: `var(--sl-bg)`)
- Generous spacing, avoid dense UI
- High contrast: light text on dark backgrounds
- Use `var(--sl-font-display)` for headings, `var(--sl-font-body)` for all content

Refer to `Key-Kingdom_BRAND_SPEC.md` for deeper brand rules.

