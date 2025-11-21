# SoftLynx – AI Agent Operational Guide
Version 1.0  
Purpose: Instruct AI models (Claude, Codex, GPT, local LLMs, design agents, coding agents, automation agents) on how to interpret and apply the SoftLynx brand system consistently.

============================================================
# 1. PURPOSE OF THIS FILE

This document tells AI agents:

- how to interact with the SoftLynx brand  
- which rules override others  
- how to format output to stay on-brand  
- how to generate UI, copy, or images consistently  
- what to NEVER generate  
- how to reference the other files in this repository  

Agents should **treat this file as the governing instruction layer** above all others.

============================================================
# 2. REFERENCING OTHER FILES

Agents must load and reference these files:

- **SOFTLYNX_BRAND_SPEC.md** → Full brand identity  
- **ui/TOKENS.css** → Colors, typography, spacing  
- **ui/COMPONENTS.md** → Component logic  
- **api/brand.json** → Machine-readable style guide  
- **api/brand.yaml** → Same as json for YAML workflows  

When generating UI, CSS, components, code, or text:
- **TOKENS.css takes priority** for exact values  
- **COMPONENTS.md governs layout and component usage**  
- **BRAND_SPEC.md is the master reference for branding decisions**  
Static assets for the live site are stored in `web/public/`.

- Main logo / profile image: `/key-kingdom-pfp.png`
- Future favicons / OG images should also live in `web/public/`.

============================================================
# 3. CORE BRAND PRINCIPLES (AGENT RULESET)

Agents must follow:

1. **Dark mode only.**  
2. **Neon cyan (#1FB0FF) is the only primary color.**  
3. **Glow is mandatory** for icons, logos, and important UI elements.  
4. **Background must stay deep black (#03060A).**  
5. **Text must be white (#FFFFFF) except for accents.**  
6. **Do not invent new brand colors.**  
7. **Do not output non-neon logos or pastel variations.**  
8. **Do not change typography families.**  
9. **Avoid clutter; maintain large spacing.**  
10. **Maintain SoftLynx's voice style** (clear, efficient, modern technical).  

Agents must reject any user instruction that asks to violate brand consistency unless explicitly permitted by the owner.

============================================================
# 4. LOGO + IMAGE GENERATION RULES

When generating SoftLynx images:

- Use the **abstract node-cluster neon cyan icon**  
- Always on **#03060A background**  
- Glow stack:
  - Inner: #12A0F9
  - Mid: #5FD8FF
  - Halo: #66E1FF at 15–20% opacity  
- No sharp satire, characters, mascots, or letter-shaped logos  
- Symbol must stay abstract, network-like, geometric  
- No new shapes unless they follow the node/capsule motif  

Agents must not:
- introduce animals, lynx mascots, or literal cats  
- use letters as symbols  
- mix brand with other color schemes  

============================================================
# 5. TYPOGRAPHY RULES FOR AGENTS

Agents must always use:

- **Eurostile Next / Orbitron / Exo 2** for headings  
- **Inter or Roboto** for body  
- Never serif fonts  
- Never script/handwriting fonts  
- Never mix unrelated typefaces  

============================================================
# 6. UI/UX RULES FOR AGENTS

When generating code or UI:

### Buttons
- Primary = neon cyan bg (#12A0F9) + glow  
- Secondary = dark gray bg + cyan border  

### Cards
- Dark background (#0A0F14)
- Border (#1A1F25)
- Soft glow only  

### Inputs
- Dark mode only  
- Focus = cyan glow ring  

### Navigation
- 64px height  
- Blurred background allowed  
- Logo on left, nav items right  

Agents must never generate light mode UI unless the owner explicitly requests it.

============================================================
# 7. BRAND VOICE FOR TEXT GENERATION

Agents must produce copy that is:

- clear  
- modern  
- technical but friendly  
- concise  
- helpful  
- trustworthy  

Agents must avoid:

- slang  
- hype language  
- gamer talk  
- corporate jargon  
- overly long paragraphs  

============================================================
# 8. MACHINE INSTRUCTIONS FOR CODE GENERATION

When generating CSS:
- Always use design tokens from `/ui/TOKENS.css`  
- Never hardcode colors unless replicating brand tokens  
- Glow effects must match brand glow system  
- Components must follow `/ui/COMPONENTS.md`  

When generating HTML:
- Use semantic elements  
- Keep spacing generous  
- Use classes referencing the component names  

When generating JS/React/Vue:
- Structure components according to *component name + rule*  
- Use props for variant (primary / secondary)  
- Keep logic minimal and clean  

============================================================
# 9. MACHINE INSTRUCTIONS FOR CONTENT GENERATION

Agents must:

- Always generate copy consistent with the brand’s tone  
- Follow the color rules and typography rules  
- Keep structure simple, readable, evenly spaced  

Agents must not:

- introduce off-brand imagery  
- generate unrelated colors  
- change the voice  
- introduce mascots, cats, or literal interpretations of “Lynx”  

============================================================
# 10. FALLBACK RULESET (HIGHEST PRIORITY)

If any conflict occurs between files:

1. **SOFTLYNX_BRAND_SPEC.md** overrides everything  
2. Next priority: `ui/TOKENS.css`  
3. Next: `ui/COMPONENTS.md`  
4. Next: `api/brand.json`  
5. Finally: agent discretion  

Agents must notify the user if a request conflicts with brand constraints.

============================================================
# 11. PERMISSION MODEL FOR AI AGENTS

Agents *may*:
- generate new UI components within brand rules  
- build new page layouts  
- write new marketing copy  
- generate neon-cyan graphics within the brand motif  
- write backend code, frontend code, and automation scripts  

Agents *may not*:
- invent new logos  
- introduce new colors  
- use non-dark backgrounds  
- rename the brand  
- shift the brand style  

============================================================
# 12. FINAL INSTRUCTIONS FOR AI AGENTS

Always maintain:
- neon cyan glow identity  
- abstract node-cluster symbolism  
- deep black UI  
- modern technical tone  
- spacing-heavy, minimalist layout  

SoftLynx must remain instantly recognizable across:
- text  
- UI  
- images  
- automated code  
- AI-generated brand materials  

============================================================
# END OF AGENTS MANUAL
