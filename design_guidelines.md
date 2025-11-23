# Design Guidelines: Freelance Platform (Kwork-style)

## Design Approach
**Reference-Based with System Thinking**: Primary inspiration from Kwork's minimalist marketplace aesthetic, combined with established patterns from Upwork, Fiverr, and productivity platforms like Linear for clean data presentation.

**Core Principle**: Efficiency-first design that prioritizes quick service discovery, clear transaction flows, and trust-building through clean information architecture.

---

## Typography System

**Font Families**:
- Primary: Inter or similar geometric sans-serif via Google Fonts
- Headings: Medium weight (500-600)
- Body: Regular (400) and Medium (500)
- UI elements: Medium (500)

**Hierarchy**:
- Page titles: text-3xl md:text-4xl font-semibold
- Section headers: text-2xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base
- Metadata/labels: text-sm
- Captions: text-xs

**Language Considerations**: Ensure adequate line-height (1.6 for body, 1.3 for headings) for Cyrillic and Turkmen characters.

---

## Layout System

**Spacing Primitives**: Use Tailwind units: 2, 3, 4, 6, 8, 12, 16, 24
- Micro spacing (buttons, inputs): p-2, p-3, gap-2
- Component padding: p-4, p-6
- Section spacing: py-8, py-12, py-16
- Page margins: px-4 md:px-6 lg:px-8

**Grid System**:
- Container: max-w-7xl mx-auto
- Service cards grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
- Form layouts: max-w-2xl for single-column forms
- Admin tables: full-width responsive tables with horizontal scroll on mobile

**Responsive Breakpoints**:
- Mobile-first approach
- Key breakpoints: md:768px, lg:1024px, xl:1280px

---

## Component Library

### Navigation Header
- Fixed top bar with max-w-7xl container
- Logo left, language switcher (RU/TM toggle), auth/profile right
- Search bar prominent in center (desktop) or expandable (mobile)
- Category navigation below header (horizontal scroll on mobile)
- Height: h-16 for top bar, h-12 for category nav
- Sticky positioning with subtle shadow on scroll

### Service Cards (Kwork Cards)
- Clean white background with subtle border
- Image/preview at top (aspect-ratio-video or square)
- Seller avatar overlapping image bottom-left (w-10 h-10)
- Title (2 lines max, text-lg font-medium)
- Price prominent (text-xl font-semibold)
- Rating stars + review count (text-sm)
- Delivery time badge
- Hover: subtle lift (translate-y-1) with shadow increase
- Padding: p-4
- Border-radius: rounded-lg

### Order Flow Cards
- Multi-step visual indicator at top (stepper component)
- Package selection: 3-column grid (Базовый, Стандарт, Премиум)
- Each package: bordered, highlighted on selection
- Clear price, features list, delivery time per package
- Extra services as checkboxes below packages
- Total price calculation sticky at bottom

### Chat Interface
- Split layout: 30% conversation list (left), 70% active chat (right)
- Conversation list: compact cards with avatar, name, last message preview, timestamp
- Chat area: messages aligned left (seller) / right (client) with distinct backgrounds
- Input at bottom: textarea with file upload button, send button
- File attachments: preview thumbnails with download option
- Timestamp: text-xs below each message
- Mobile: full-screen chat when conversation selected

### Balance & Transaction Cards
- Dashboard cards showing: Available balance, Pending, Total earned
- Each card: p-6, large number display (text-3xl), label (text-sm)
- Transaction history: table format with filters
- Withdrawal request form: clear steps, amount input, method selection

### Rating & Review Components
- Star rating: large clickable stars (w-8 h-8) for input, smaller for display
- Review card: avatar, name, rating stars, date, review text
- Seller response: indented, distinct background, "Ответ продавца" label
- Sorting: newest, highest rated, lowest rated

### Admin Panel
- Sidebar navigation (w-64) with collapsible sections
- Data tables: striped rows, sortable headers, action buttons in last column
- Status badges: pill-shaped with appropriate semantic styling
- Moderation queue: card-based layout with approve/reject actions
- Charts for statistics: simple bar/line charts for earnings, orders over time

### Forms & Inputs
- Input fields: h-10, px-3, rounded-md border
- Textareas: min-h-24
- Select dropdowns: styled consistently with inputs
- File uploads: drag-and-drop zone with preview
- Buttons primary: px-6 py-2.5 rounded-md font-medium
- Buttons secondary: px-6 py-2.5 rounded-md border
- Form spacing: space-y-4 for field groups
- Labels: text-sm font-medium mb-1.5

### Category Browsing
- Category cards: icon + label, arranged in grid (4-6 columns desktop)
- Each category: p-6, centered content, hover state
- Subcategories: dropdown menu or dedicated page with breadcrumbs
- Filter sidebar: collapsible panels for Price, Rating, Delivery time
- Results count displayed prominently

### User Profiles
- Cover area (h-32) with avatar centered at bottom overlap (w-24 h-24)
- Profile stats row: grid-cols-3 showing orders completed, rating, response time
- About section: max-w-3xl prose
- Portfolio grid: masonry or uniform grid, lightbox on click
- Service listings: same card style as main marketplace

### Notification System
- Bell icon in header with badge count
- Dropdown panel (max-w-sm) with notification list
- Each notification: compact, icon, message, timestamp, unread indicator
- Action buttons inline where applicable

### Dispute/Arbitration Interface
- Timeline view showing order history
- Evidence upload area for both parties
- Admin controls: resolution options, refund calculator
- Clear status indicator throughout

---

## Images

**Service Card Images**: 
- Showcase service/portfolio work
- Aspect ratio: 16:9 or 1:1 depending on category
- Optimized for fast loading

**User Avatars**:
- Circular, consistent sizing across platform
- Fallback to initials if no image

**Portfolio Images**:
- Multiple images per service
- Gallery/carousel for browsing
- Support for video thumbnails

**Category Icons**:
- Consistent icon set (Heroicons or similar)
- Simple, recognizable symbols for each category

**No large hero images** - This is a utility platform, not marketing site. Focus on quick access to services.

---

## Animations

**Minimal, Purpose-Driven**:
- Card hover: subtle scale or lift (duration-200)
- Button interactions: slight scale on click
- Loading states: simple spinner or skeleton screens
- Modal/dialog: fade + scale entrance
- Toast notifications: slide in from top-right
- **No decorative animations** - performance and clarity priority

---

## Key UX Patterns

**Trust Indicators**: Verified badges, rating stars, review counts, completion stats visible on all seller touchpoints

**Progressive Disclosure**: Complex forms broken into steps, expandable sections for details

**Immediate Feedback**: Loading states on all async actions, success/error toasts

**Bilingual Consistency**: All UI elements mirrored perfectly in both languages, consistent spacing regardless of text length

**Mobile-First Interactions**: Bottom sheets for filters/actions on mobile, hamburger menu for navigation, swipeable chat conversations

---

This design creates a professional, efficient marketplace that prioritizes user trust and transaction clarity while maintaining the clean, minimalist aesthetic of Kwork.