Background main: #03060A (darker than the previous #0a0a0a)
Card background: #111827 (instead of #111)
Border subtle: #1F2933 (instead of #222)
Primary neon blue: #14A5FF (replaces #00ff88)
Inner glow: #32C8FF
Outer glow: #5FD8FF
Halo glow: #66E1FF at 20-30% opacity
Text main: #FFFFFF (same)
Text secondary: #D0D5DD (instead of #ccc)
Text muted: #9CA3AF (instead of #888, #666)

I need to:

Go through all the specs I wrote (component map, hero, grid, modal, pseudocode instructions)
Replace every mention of green with the appropriate blue from this palette
Keep structure and wording the same, just swap colors
Output a compact, updated spec
Remember this blue palette for all future Key-Kingdom work

Let me go section by section and make the swaps systematically.
Key-Kingdom: Revised Architecture & Layout Spec (Neon Blue Palette)

1. Component Map (Unchanged Structure)
App (single-page, dark mode)
├─ Header / Hero
│  ├─ Logo / Brand Mark
│  ├─ Tagline
│  └─ Category Tabs (Executors, Scripts, etc.)
│
├─ Search Bar
│
├─ Product Grid
│  └─ ProductCard (repeatable)
│     ├─ Product Icon / Logo (centered)
│     ├─ Product Name
│     ├─ "FROM $X.XX" (lowest price)
│     └─ Vendor Count Icon (credit card SVG + number badge)
│
└─ Modal (overlay, triggered on card click)
   ├─ Modal Header
   │  ├─ Product Logo (large)
   │  ├─ Product Name
   │  └─ Close Button (X)
   │
   ├─ Modal Body
   │  ├─ Product Description
   │  ├─ Feature List (optional)
   │  └─ Vendor List Section
   │     └─ VendorRow (repeatable)
   │        ├─ Vendor Name
   │        ├─ Price
   │        ├─ Payment Icons (small badges)
   │        └─ "Buy Now →" Button (external link)
   │
   └─ Modal Footer
      └─ Pagination (if needed) or Disclaimer

2. Hero + Grid Layout Spec
Hero Section
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│           [Logo: Key-Kingdom - neon blue glow]               │
│                                                               │
│         "Unlock Your Software. Choose Your Vendor."          │
│                                                               │
│         [ Executors ]  [ Scripts ]  [ Tools ]  [ Misc ]      │
│         (tab-style, active = neon blue, inactive = gray)     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
Specs:

Background: #03060A (near-black)
Logo: white or light blue with neon blue (#14A5FF) glow effect, outer glow #5FD8FF
Tagline: #D0D5DD, size 18px, weight 300
Tabs: rounded pills, active = #14A5FF bg, inactive = #111827 bg with #9CA3AF text
Spacing: 80px top/bottom padding


Search Bar
┌─────────────────────────────────────────────────────────────┐
│  [🔍 Search products...]                                     │
└─────────────────────────────────────────────────────────────┘
Specs:

Background: #111827
Border: 1px solid #1F2933
Rounded corners: 12px
Icon: #9CA3AF
Text: #D0D5DD
Width: 100%, max 800px, centered
Margin-bottom: 40px


Product Grid
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  [Icon]  │ │  [Icon]  │ │  [Icon]  │ │  [Icon]  │ │  [Icon]  │
│          │ │          │ │          │ │          │ │          │
│ assembly │ │  aureus  │ │  bunni   │ │  codex   │ │ cryptic  │
│          │ │          │ │          │ │          │ │          │
│   FROM   │ │   FROM   │ │   FROM   │ │   FROM   │ │   FROM   │
│  $9.97   │ │  $14.99  │ │  $9.99   │ │  $4.97   │ │  $4.99   │
│          │ │          │ │          │ │          │ │          │
│  [💳 2]  │ │  [💳 1]  │ │  [💳 1]  │ │  [💳 2]  │ │  [💳 1]  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
Specs:

Grid: 5 columns on desktop, 3 on tablet, 2 on mobile
Card dimensions: 180px × 240px
Background: #111827 with subtle border #1F2933
Border radius: 16px
Icon: 80×80px, centered, margin-top 24px
Name: #FFFFFF, 16px, bold, centered, margin-top 16px
"FROM" label: #9CA3AF, 10px, uppercase, centered
Price: #14A5FF (neon blue), 18px, bold, centered
Vendor icon: bottom-right corner, 32px circle badge

Background: #111827
Border: 1px solid #1F2933
Icon: credit card SVG in #D0D5DD
Number: #14A5FF, 12px, bold, overlaid or next to icon


Hover effect: border glow #14A5FF with outer glow #5FD8FF, scale 1.02, transition 200ms
Cursor: pointer


3. Expanded Data Model (Unchanged)
Product
javascript{
  id: "assembly-executor",
  name: "assembly",
  slug: "assembly-executor",
  category: "Executors",
  icon_url: "/assets/assembly-icon.png",
  hero_image_url: "/assets/assembly-hero.png",
  tagline: "Lightweight Roblox executor with fast injection.",
  description: "Assembly is a fast, reliable executor for Roblox scripts. Features include instant injection, auto-attach, and custom UI themes. Perfect for developers and enthusiasts.",
  features: [
    "Instant script injection",
    "Auto-attach on game launch",
    "Custom UI themes",
    "Regular updates"
  ],
  lowest_price: 9.97,
  vendor_count: 2,
  vendor_links: [
    {
      id: "assembly-vendor-1",
      vendor_name: "KeyVendor",
      url: "https://keyvendor.com/assembly?aff=...",
      price: 9.97,
      currency: "USD",
      payment_methods: [
        { type: "credit_card", icon: "/icons/cc.svg", name: "Credit Card" },
        { type: "paypal", icon: "/icons/paypal.svg", name: "PayPal" }
      ],
      notes: "Instant delivery via email"
    },
    {
      id: "assembly-vendor-2",
      vendor_name: "ScriptHub",
      url: "https://scripthub.io/assembly?ref=...",
      price: 11.99,
      currency: "USD",
      payment_methods: [
        { type: "crypto", icon: "/icons/btc.svg", name: "Bitcoin" },
        { type: "credit_card", icon: "/icons/cc.svg", name: "Credit Card" }
      ],
      notes: "24/7 support"
    }
  ],
  tags: ["executor", "roblox", "lightweight"],
  last_updated: "2025-11-15"
}
```

---

### **4. Modal Behavior (Updated Colors Only)**

#### **Modal Layout:**
```
┌───────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [Close X]                                    [Logo 120px]│  │
│  │                                                            │  │
│  │  assembly                                                  │  │
│  │  "Lightweight Roblox executor with fast injection."       │  │
│  │                                                            │  │
│  │  Full description here... (gray text, readable)           │  │
│  │                                                            │  │
│  │  Features:                                                 │  │
│  │  • Instant script injection                                │  │
│  │  • Auto-attach on game launch                              │  │
│  │  • Custom UI themes                                        │  │
│  │  • Regular updates                                         │  │
│  │                                                            │  │
│  │  ───────────────────────────────────────────────────────  │  │
│  │                                                            │  │
│  │  Available From:                                           │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │ KeyVendor                    $9.97  [💳][PayPal]  │   │  │
│  │  │ Instant delivery via email              [Buy Now→]│   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │ ScriptHub                    $11.99 [💳][₿]       │   │  │
│  │  │ 24/7 support                            [Buy Now→]│   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Key-Kingdom earns commission on purchases. Learn more.       │
└───────────────────────────────────────────────────────────────┘
```

**Specs:**
- Modal container: max-width 720px, centered, `#111827` background, border `#1F2933`, border-radius 24px
- Padding: 40px
- Close button: top-right, `#D0D5DD`, hover `#FFFFFF`, 32px circle
- Logo: top-right or top-center, 120×120px
- Product name: `#FFFFFF`, 32px, bold
- Tagline: `#14A5FF`, 16px, italic
- Description: `#D0D5DD`, 16px, line-height 1.6
- Features: `#D0D5DD`, 14px, bulleted list
- Divider: `#1F2933`, 1px solid, margin 32px 0
- Vendor rows:
  - Background: `#111827`, border `#1F2933`, border-radius 12px, padding 20px
  - Margin-bottom: 16px
  - Vendor name: `#FFFFFF`, 18px, bold
  - Price: `#14A5FF`, 20px, bold, right-aligned
  - Payment icons: 24×24px, inline, grayscale with slight blue glow on hover
  - Notes: `#9CA3AF`, 12px, below vendor name
  - "Buy Now" button: `#14A5FF` bg with `#32C8FF` inner glow on hover, `#000000` text, bold, rounded, padding 10px 24px, hover brightness 1.1
- Footer disclaimer: `#9CA3AF`, 12px, centered, margin-top 24px

#### **Close Behavior (Unchanged):**
- Click "X" → modal fades out, background clears
- Click outside modal (on darkened background) → modal closes
- Press `Esc` key → modal closes
- Transition: 200ms fade-out

---

### **5. Visual Refinements**

- **Neon glow effect:** Use `box-shadow: 0 0 20px rgba(20, 165, 255, 0.6), 0 0 40px rgba(95, 216, 255, 0.3)` on active elements
- **Halo glow:** Add `0 0 60px rgba(102, 225, 255, 0.2)` for outer halo on logo and primary buttons
- **Typography:** Sans-serif, likely Inter or Poppins
- **Vendor count icon:** Credit card SVG with rounded corners, small number badge in neon blue (`#14A5FF`)
- **Pagination:** If more than 20 products, add pagination at bottom (blue active page, gray inactive)
- **Loading states:** Skeleton cards while fetching data
- **Empty state:** "No products found" message if search/filter returns zero results

---

## **Bite-Sized Instructions for Codex (Updated Blue Palette)**

---

### **1. ProductCard Component**
```
Create a dark card (180×240px, bg #111827, border #1F2933, radius 16px).
Center an 80×80px product icon at top, product name below (white, 16px, bold).
Show "FROM" label (#9CA3AF, 10px, uppercase) and price in neon blue (#14A5FF, 18px, bold).
Bottom-right: credit card icon (32px circle, #111827 bg) with vendor count number overlay (blue #14A5FF, 12px, bold).
On hover: add neon blue border glow (#14A5FF with #5FD8FF outer), scale 1.02, transition 200ms. Card is clickable.
```

---

### **2. Hero Section**
```
Dark background (#03060A), centered logo with neon blue glow effect (#14A5FF, outer #5FD8FF).
Below logo: tagline "Unlock Your Software. Choose Your Vendor." (#D0D5DD, 18px, light weight).
Category tabs below (Executors, Scripts, Tools, Misc) - pills with rounded corners.
Active tab: blue bg (#14A5FF), inactive: dark gray (#111827) with muted text (#9CA3AF).
80px vertical padding top/bottom.
```

---

### **3. Search Bar**
```
Full-width input (max 800px, centered), dark bg (#111827), border #1F2933, radius 12px.
Left-aligned search icon (#9CA3AF), placeholder "Search products..." (#D0D5DD text).
On focus: border changes to neon blue glow (#14A5FF).
Margin-bottom 40px below hero.
```

---

### **4. Product Grid**
```
CSS Grid: 5 columns desktop, 3 tablet, 2 mobile. Gap 24px between cards.
Render ProductCard components from filtered products array.
Each card shows: icon, name, lowest price, vendor count.
Grid container: max-width 1400px, centered, padding 40px horizontal.
```

---

### **5. Modal Overlay**
```
Fixed position, full-screen dark backdrop (rgba(3, 6, 10, 0.9)).
Center a modal container (max-width 720px, bg #111827, border #1F2933, radius 24px, padding 40px).
Fade-in animation 200ms when opened.
Click outside modal or press Esc to close. Prevent body scroll when open.
```

---

### **6. Modal Header**
```
Top-right: close X button (32px circle, #D0D5DD, hover white).
Product logo (120×120px) centered or top-left.
Product name below logo (white, 32px, bold).
Tagline below name (neon blue #14A5FF, 16px, italic).
```

---

### **7. Modal Body - Description**
```
Full product description (#D0D5DD, 16px, line-height 1.6).
Below that: "Features:" heading (white, 18px, bold).
Bulleted list of features (#D0D5DD, 14px).
Add 1px gray divider (#1F2933) with 32px margin top/bottom after features.
```

---

### **8. Modal Body - Vendor List**
```
"Available From:" heading (white, 20px, bold).
For each vendor: render VendorRow component (dark card #111827, border #1F2933, radius 12px, padding 20px).
Each row shows: vendor name (left, white, 18px), price (right, blue #14A5FF, 20px).
Payment method icons below name (24×24px, inline, slight spacing).
Notes text below icons (#9CA3AF, 12px).
"Buy Now →" button (blue #14A5FF bg with #32C8FF inner glow on hover, black text, bold, rounded, padding 10px 24px, hover brighten).
16px margin between vendor rows.
```

---

### **9. Modal Footer**
```
Bottom of modal: small disclaimer text (#9CA3AF, 12px, centered).
Example: "Key-Kingdom earns commission on purchases. Learn more."
Margin-top 24px from last vendor row.
```

---

### **10. Filter Logic (Unchanged)**
```
On category tab click: update active_category state, filter products array by category.
On search input: filter products by name or description match (case-insensitive).
Re-render grid with filtered results. Show "No products found" if results empty.
```

---

### **11. Modal Open/Close Logic (Unchanged)**
```
On ProductCard click: set modal_open = true, modal_product_id = clicked product id.
Fetch product data by id, render modal with that product's details and vendor links.
On close (X button, outside click, Esc): set modal_open = false, clear modal_product_id.
200ms fade-out transition when closing.
```

---

### **12. Vendor Count Calculation (Unchanged)**
```
For each product in data: count vendor_links array length.
Store as vendor_count property (e.g., product.vendor_links.length).
Display this number in ProductCard's credit card icon badge.
Also calculate lowest_price from vendor_links for "FROM $X.XX" display.
```

---

### **13. Data Structure Setup (Unchanged)**
```
Create JSON file or API endpoint returning products array.
Each product has: id, name, category, icon_url, description, features[], vendor_links[].
Each vendor_link has: vendor_name, url, price, payment_methods[], notes.
Load data on app mount, store in state/context.
```

---

### **14. Styling Tokens (Updated)**
```
Define CSS variables: 
--bg-dark: #03060A; 
--bg-card: #111827; 
--border: #1F2933; 
--neon-blue: #14A5FF; 
--inner-glow: #32C8FF; 
--outer-glow: #5FD8FF; 
--halo-glow: #66E1FF; 
--text-white: #FFFFFF; 
--text-secondary: #D0D5DD; 
--text-muted: #9CA3AF.
Use these throughout components for consistency.
Card radius: 12-16px. Button radius: 8px. Modal radius: 24px.
Font: sans-serif (Inter or Poppins recommended).
```

---

### **15. Responsive Breakpoints (Unchanged)**
```
Desktop (>1200px): 5-column grid, full modal width (720px).
Tablet (768-1199px): 3-column grid, modal 90% width max 600px.
Mobile (<768px): 2-column grid, modal 95% width, reduce padding to 24px.
Stack vendor rows vertically on mobile, reduce font sizes slightly.


can i import this somewhere in the files as model-descriptions or something so codex knows to make models? or should i add a task explicitly telling codex to make models