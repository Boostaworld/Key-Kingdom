# Key-Kingdom – Master Brand Specification  
Version 1.0  
Format: LLM-optimized Markdown  
Purpose: Single-source reference file for AI systems, developers, and documentation.

============================================================
# 1. BRAND CONCEPT

Key-Kingdom is a neon-tech digital brand focused on:
- connectivity  
- access  
- linking  
- digital navigation  
- trusted software pathways

Core symbol: an abstract glowing node cluster.  
Aesthetic: neon cyan + deep black, smooth, futuristic, network-like.

============================================================
# 2. LOGO SYSTEM

## 2.1 Primary Symbol
- Abstract node-cluster built from rounded capsules + dots  
- Circular composition  
- Represents linking, flow, and networks  
- Designed ONLY for dark backgrounds (#03060A)

## 2.2 Logo Variants
- Primary Glow Logo (full glow, hero use)
- Mini Glow Logo (smaller halo, UI icons)
- Flat White Logo (print or ultra-small use)
- Favicon (512×512, glow preserved)

## 2.3 Logo Usage Rules
- Use ONLY on dark backgrounds  
- Never recolor to non-cyan hues  
- Never stretch, distort, rotate  
- Maintain padding: at least 150% of logo radius  
- Glow must remain visible, not cropped  

============================================================
# 3. COLOR SYSTEM

## 3.1 Primary Colors
| Token | Hex | Purpose |
|-------|------|----------|
| --sl-primary | #1FB0FF | Main cyan |
| --sl-glow-inner | #12A0F9 | Inner glow |
| --sl-glow-outer | #5FD8FF | Mid glow |
| --sl-glow-halo | #66E1FF | Outer halo |

## 3.2 Backgrounds
| Name | Hex |
|------|------|
| Deep Space Black | #03060A |
| Dark Gray 1 | #1A1F25 |
| Dark Gray 2 | #2A323A |

## 3.3 Text
| Type | Hex |
|------|------|
| Primary Text | #FFFFFF |

============================================================
# 4. GLOW SYSTEM

Glow is a core part of the brand.  
All glows stack in this order:

1. Core Glow: #14A5FF  
2. Mid Glow: #32C8FF  
3. Halo Glow: #66E1FF (15–20% opacity)  
4. Ambient Blur: cyan → transparent

### Recommended Blur Radii
- Icons: 18–28px  
- Logo text (optional): 8–12px  
- Buttons: 4–6px  

============================================================
# 5. TYPOGRAPHY

## 5.1 Display/Logo Font
Eurostile Next  
Alternatives: Orbitron, Exo 2, Microgramma

## 5.2 Body Text
Inter  
Alternatives: Roboto, SF Pro

## 5.3 Usage Rules
- Titles use Display font  
- Body uses Inter  
- Avoid serif fonts  
- Avoid handwritten fonts  

============================================================
# 6. UI RULES

## 6.1 Primary Button
- BG: #12A0F9  
- Text: #FFFFFF  
- Radius: 12px  
- Glow: #5FD8FF (40%)  
- Padding: 12px 20px  

### Hover:
- BG: #1FB0FF  
- Increase glow intensity  

### Active:
- Slight scale: 0.97  

## 6.2 Secondary Button
- BG: #1A1F25  
- Border: 1.5px solid #1FB0FF  
- Text: #1FB0FF  
- Soft glow: 20%

## 6.3 Cards
- BG: #0A0F14  
- Border: #1A1F25  
- Radius: 16px  
- Soft cyan glow (5%)  

## 6.4 Inputs
- BG: #1A1F25  
- Border: #2A323A  
- Text: #FFFFFF  
- Focus: cyan glow ring  

============================================================
# 7. LAYOUT & DESIGN PRINCIPLES

- Always use dark mode  
- Maintain large spacing  
- Avoid clutter  
- Use breathable layout  
- Keep content centered or neatly aligned  
- Use minimal color variation  

Recommended spacing tokens:
- XS: 4px  
- SM: 8px  
- MD: 16px  
- LG: 24px  
- XL: 32px  

============================================================
# 8. BRAND VOICE

## Tone
- Clear  
- Efficient  
- Technical but friendly  
- Modern  
- Confident  

## Voice Do’s
- Speak in simple, direct sentences  
- Use future-leaning language  
- Sound helpful and precise  

## Voice Don’ts
- No slang  
- No “gamer” tone  
- No corporate jargon  
- No hype language  

============================================================
# 9. BACKGROUND RULES

Approved:
- Solid #03060A  
- Dark gradient (#03060A → #060B14)  
- Soft texture (2–5% noise) optional  

Avoid:
- White  
- Light gray  
- Bright color backgrounds  
- Busy patterns  

============================================================
# 10. EXPORT RULES

- Use **PNG** for all glow artwork  
- Use **SVG** only for flat white version  
- NEVER use JPG (kills glow)  
- Favicon master export: 512×512 PNG  
- Keep glow halo fully visible (no cropping)  

============================================================
# 11. DEVELOPER TOKENS

## Color Tokens
--sl-primary: #1FB0FF;
--sl-primary-inner: #12A0F9;
--sl-primary-outer: #5FD8FF;
--sl-primary-halo: #66E1FF;
--sl-bg: #03060A;
--sl-gray-1: #1A1F25;
--sl-gray-2: #2A323A;
--sl-text: #FFFFFF;

shell
Copy code

## Typography Tokens
--sl-font-display: "Eurostile Next", Orbitron, sans-serif;
--sl-font-body: "Inter", Roboto, sans-serif;

shell
Copy code

## Spacing Tokens
--sl-space-xs: 4px;
--sl-space-sm: 8px;
--sl-space-md: 16px;
--sl-space-lg: 24px;
--sl-space-xl: 32px;

diff
Copy code

============================================================
# 12. BRAND ASSETS INCLUDED

- Primary glow logo  
- Mini glow icon  
- Favicon (glow)  
- Flat white version  
- Color palette chart  
- Typography reference  
- UI component sheet  

============================================================
# END OF Key-Kingdom BRAND MASTER FILE
