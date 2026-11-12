# UI/UX DESIGN SYSTEM & SPECIFICATION DOCUMENT
# Innowit One Workspace (Business Operating System)
**Document Version:** 1.0.0  
**Design Direction:** Dark Terminal Aesthetics, Swiss Grid Precision & Clean Enterprise Ergonomics  
**Brand Identity Anchor:** Innowit Corporate Core (Teal `#00B3C8`, Orange `#E8631A`, Dark Base `#1A1A1A`)

---

## 1. Design Philosophy & Aesthetic Principles

Innowit One Workspace combines the utilitarian clarity of Swiss graphic design with the focus of modern developer terminals and high-end enterprise platforms:
1. **High Information Density with Zero Clutter:** Compact, structured data tables and clean borders maximize screen real estate for complex workflows without overwhelming the user.
2. **Deterministic Visual Hierarchy:** Visual weight is strictly calibrated: high-contrast headings, muted secondary labels, high-visibility interactive buttons, and reserved accent highlights.
3. **Hardware-Accelerated Fluidity:** Micro-interactions (hover states, modal overlays, slide-over drawers) use 150ms-200ms cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) with zero layout reflow.
4. **Unambiguous Semantic Coloring:** Functional colors are never used decoratively. Green is reserved for verified fiscal receipts and balanced ledgers; red for validation failures, overdue accounts, and KRA rejections; amber for pending submissions and warnings.

---

## 2. Color Palette & Token Architecture

The design system uses CSS Custom Properties (variables) mapped directly to Tailwind CSS utility classes.

### 2.1 Innowit Core Brand Tokens
| Token Name | Hex Code | HSL Value | Primary Usage |
|---|---|---|---|
| `--color-brand-teal` | `#00B3C8` | `186, 100%, 39%` | Primary interactive elements, active links, primary buttons, brand logos |
| `--color-brand-orange` | `#E8631A` | `21, 82%, 51%` | High-priority callouts, action banners, urgent badge indicators |
| `--color-dark-base` | `#1A1A1A` | `0, 0%, 10%` | Primary application surface, top bar, dark mode backgrounds |
| `--color-sidebar-bg` | `#1E1B2E` | `249, 25%, 15%` | Left navigation sidebar base background (deep purple-slate) |
| `--color-sidebar-active` | `#2D2254` | `253, 42%, 23%` | Active item highlight in sidebar navigation |

### 2.2 Neutral & Surface Scale
| Token Name | Hex Code | HSL Value | Application |
|---|---|---|---|
| `--bg-canvas` | `#0F1115` | `220, 16%, 7%` | Main backdrop canvas |
| `--bg-surface` | `#161920` | `220, 18%, 10%` | Working cards, data table wrappers, modal backdrops |
| `--bg-surface-raised` | `#1F2430` | `220, 22%, 15%` | Hovered rows, dropdown menus, slide-over drawers |
| `--border-subtle` | `#282E3E` | `222, 21%, 20%` | Card outlines, table cell borders, section dividers |
| `--border-strong` | `#3D465E` | `223, 21%, 30%` | Input field borders, focused borders, active tabs |
| `--text-primary` | `#F1F5F9` | `210, 40%, 96%` | Headings, primary table text, input text |
| `--text-secondary` | `#94A3B8` | `215, 16%, 65%` | Subtitles, field labels, metadata timestamps |
| `--text-muted` | `#64748B` | `215, 16%, 47%` | Placeholder text, disabled labels, table column headers |

### 2.3 Semantic & Fiscal Status Palette
| Semantic Role | Hex Code | Background Tint (15%) | Usage in ERP / Compliance |
|---|---|---|---|
| **Success / Validated** | `#10B981` | `#064E3B` | Balanced ledger entry, KRA Accepted invoice, Paid status |
| **Danger / Rejected** | `#EF4444` | `#7F1D1D` | KRA Rejected invoice, Unbalanced journal, Overdue bill |
| **Warning / Pending** | `#F59E0B` | `#78350F` | eTIMS Submission In-Flight, Unapproved PO, Low stock alert |
| **Info / Draft** | `#3B82F6` | `#1E3A8A` | Draft invoice, Quotation stage, Unposted journal entry |
| **Sandbox Environment** | `#8B5CF6` | `#4C1D95` | Prominent sandbox test badge, test invoice watermark |

---

## 3. Typography & Hierarchy

### 3.1 Font Families
- **Primary Interface Font:** `Inter`, `Geist Sans`, or system `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Numerical & Code Font:** `JetBrains Mono`, `Geist Mono`, or `Fira Code` for all financial figures, invoice numbers, KRA PINs, barcodes, and SKUs. Numerical columns must always use tabular figures (`font-variant-numeric: tabular-nums`).

### 3.2 Typographic Hierarchy Table
| Style Name | Font Size | Line Height | Weight | Letter Spacing | Case | Usage |
|---|---|---|---|---|---|---|
| **Display 1** | `28px (1.75rem)` | `36px` | `700 (Bold)` | `-0.025em` | Sentence | Module hero titles, BI revenue figures |
| **Heading 2** | `20px (1.25rem)` | `28px` | `600 (Semibold)`| `-0.02em` | Sentence | Section titles, drawer headings |
| **Heading 3** | `16px (1.0rem)` | `24px` | `600 (Semibold)`| `-0.01em` | Sentence | Card titles, modal headers |
| **Body Default** | `14px (0.875rem)`| `20px` | `400 (Regular)` | `0.0em` | Sentence | General body text, form field values |
| **Body Medium** | `14px (0.875rem)`| `20px` | `500 (Medium)`  | `0.0em` | Sentence | Interactive buttons, navigation items |
| **Table Data** | `13px (0.8125rem)`| `18px` | `400 (Regular)` | `0.0em` | Sentence | Table rows, journal line items |
| **Mono Number** | `13px (0.8125rem)`| `18px` | `500 (Medium)`  | `0.02em` | None | KES currency, PIN, SKU, Invoice # |
| **Caption / Label**| `11px (0.6875rem)`| `16px` | `600 (Semibold)`| `0.05em` | UPPERCASE | Table headers, status badges, overline |

---

## 4. Spacing, Grid & Responsive Layout Architecture

### 4.1 Base Spacing Unit
The layout operates on a strict **4px / 8px grid scale**:
- `space-1`: `4px` (micro gaps between badge icons and text).
- `space-2`: `8px` (input padding-y, button icon gap).
- `space-3`: `12px` (compact card padding, table row padding-y).
- `space-4`: `16px` (standard card padding, form field gaps).
- `space-6`: `24px` (dashboard card grid gaps, section margins).
- `space-8`: `32px` (page header bottom margin, major section dividers).

### 4.2 Breakpoints & Layout Adapters
- **Desktop (>= 1440px):**
  - Left Sidebar: Expanded (`260px` fixed width).
  - Main Canvas: Fills remaining viewport with maximum width `1600px` centered.
  - Data Tables: Multi-column view with all 8-10 columns visible without horizontal scroll.
  - Detail Drawers: Slide-in overlay on right (`480px` or `640px` wide).
- **Tablet / Small Laptop (768px - 1439px):**
  - Left Sidebar: Collapsible to icon-only mode (`64px` width) with tooltips.
  - Data Tables: Responsive column priority (less critical columns hidden or toggleable via column visibility menu).
- **Mobile (375px - 767px):**
  - Left Sidebar: Hidden off-screen, triggered via hamburger button into full-height sheet drawer.
  - Top Bar: Compact header showing active page title, search icon, and user profile avatar.
  - Data Tables: Replaced with responsive card stack lists. Each record displays as a card with primary title, amount, status badge, and chevron arrow.
  - Bottom Navigation Bar (Optional Mobile Web): Quick tabs for Home, CRM, Invoices, Chat, More.

---

## 5. UI Component Specifications

### 5.1 Collapsible Sidebar Navigation
- Deep slate-purple background (`#1E1B2E`) with subtle right border (`1px solid #282E3E`).
- Grouped sections with muted uppercase headers (e.g., `COLLABORATION`, `CRM & SALES`, `ACCOUNTING`).
- Navigation Item:
  - Default: Height `36px`, rounded `6px`, padding `0 12px`, text `#94A3B8`, icon `18px`.
  - Hover: Background `#25203A`, text `#F1F5F9`.
  - Active: Background `#2D2254`, text `#00B3C8` (Teal), left border accent `3px solid #00B3C8`.

### 5.2 Top Navigation & Control Bar
- Height: `56px`, background `#1A1A1A`, bottom border `1px solid #282E3E`.
- Left: Workspace name, branch selector dropdown.
- Center: Quick search button ("Search anything... Ctrl+K") with shortcut badge (`Ctrl K`).
- Right:
  - eTIMS Environment Pill: Displaying `[SANDBOX]` (Purple) or `[LIVE PRODUCTION]` (Green).
  - Notification Bell: With unread badge counter (Red circle with number).
  - User Menu: Avatar image or initials, name, role badge dropdown.

### 5.3 Data Tables (TanStack Table + Radix)
- Wrapper: Border `1px solid #282E3E`, rounded `8px`, overflow hidden.
- Header: Background `#161920`, height `40px`, uppercase text `11px`, letter-spacing `0.05em`, sort indicator arrows.
- Rows: Background `#0F1115`, height `44px`, border-bottom `1px solid #1F2430`.
- Hover State: Background `#161920` with smooth transition.
- Selected Row: Background `#1E293B` with primary checkbox checked.
- Numerical Cells: Right-aligned, `font-mono`, tabular numbers.
- Pagination Bar: Bottom controls showing "Showing 1 to 25 of 450 results", page selector, and previous/next arrow buttons.

### 5.4 Metric / KPI Cards
- Background `#161920`, border `1px solid #282E3E`, rounded `10px`, padding `20px`.
- Top Row: Card title (`13px`, text-muted) and contextual icon (e.g., DollarSign, Users, ShoppingBag).
- Middle Row: Primary value (`28px`, bold, font-mono, e.g., `KES 1,420,500.00`).
- Bottom Row: Comparison pill (`+12.4% from last month` in green with trending up arrow).

### 5.5 Forms & Input Controls
- Label: `12px`, medium, `#94A3B8`, marginBottom `6px`.
- Input Field: Height `38px`, background `#0F1115`, border `1px solid #282E3E`, rounded `6px`, padding `0 12px`, text `14px` `#F1F5F9`.
  - Focus: Border `1px solid #00B3C8` (Teal), ring `2px rgba(0, 179, 200, 0.2)`.
  - Error: Border `1px solid #EF4444`, red error text below `12px`.
- Select Dropdown: Accessible Radix Select with custom chevron icon and search filtering.

### 5.6 Status Badges & Pills
- Pill shape: Rounded `9999px`, height `22px`, padding `0 10px`, font size `11px`, font weight `600`, uppercase.
- Status Variants:
  - `KRA Accepted`: Background `rgba(16, 185, 129, 0.15)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.3)`.
  - `KRA Rejected`: Background `rgba(239, 68, 68, 0.15)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.3)`.
  - `Pending eTIMS`: Background `rgba(245, 158, 11, 0.15)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.3)`.
  - `Draft`: Background `rgba(100, 116, 139, 0.15)`, text `#94A3B8`, border `1px solid rgba(100, 116, 139, 0.3)`.
  - `Sandbox Test`: Background `rgba(139, 92, 246, 0.15)`, text `#8B5CF6`, border `1px solid rgba(139, 92, 246, 0.3)`.

---

## 6. Comprehensive Component States Matrix

Every component must implement all states explicitly:

| State | Visual Behavior | Interactive Rule |
|---|---|---|
| **Default** | Base background, subtle border, standard text hierarchy | Clickable, accessible via tab focus |
| **Hover** | Surface lifts by 1 shade (`#1F2430`), border brightens, cursor pointer | Instant visual feedback (100ms transition) |
| **Active / Pressed** | Slight scale down (`scale(0.98)`), background deepens | Triggered on mouse down |
| **Focus-Visible** | High-contrast teal outline (`2px solid #00B3C8`) with 2px offset | Keyboard accessibility requirement |
| **Disabled** | Opacity `0.45`, cursor `not-allowed`, pointer-events `none` | Prevents duplicate click triggers |
| **Loading (Button)** | Text hidden, centered spinning SVG icon, disabled state active | Prevents double submission |
| **Loading (Table/Card)**| Animated shimmering skeleton blocks (`animate-pulse`) matching layout | Prevents layout shift during data fetch |
| **Empty State** | Centered SVG illustration, friendly title, descriptive helper text, and primary action button (e.g., "Create First Invoice") | Never leave blank white/black space |
| **Error Banner** | Red container (`rgba(239, 68, 68, 0.1)`), alert icon, error message, retry button | Persistent until resolved or dismissed |
| **Success Toast** | Slides in from bottom-right, green icon, message, auto-dismiss in 4 seconds | Informs user without modal blockage |
