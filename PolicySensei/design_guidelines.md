# Reddit Policy Insights Prototype - Design Guidelines

## Design Approach: Design System
**Selected System**: Fluent Design for data-heavy, enterprise applications
**Justification**: This is a utility-focused tool for government professionals requiring efficiency, clarity, and professional credibility over visual flair.

## Core Design Elements

### Color Palette
**Light Mode:**
- Primary: 220 85% 25% (Deep blue for headers, primary actions)
- Background: 0 0% 98% (Clean white-gray)
- Surface: 0 0% 100% (Pure white cards)
- Text Primary: 220 15% 15% (Dark gray)
- Text Secondary: 220 10% 45% (Medium gray)

**Dark Mode:**
- Primary: 220 75% 65% (Lighter blue for contrast)
- Background: 220 15% 8% (Dark blue-gray)
- Surface: 220 12% 12% (Elevated dark surface)
- Text Primary: 0 0% 95% (Off-white)
- Text Secondary: 220 5% 70% (Light gray)

**Sentiment Colors:**
- Positive: 140 60% 40% (Professional green)
- Negative: 0 65% 50% (Clear red)
- Neutral: 220 10% 50% (Balanced gray)

### Typography
- **Primary**: Inter (Google Fonts) - clean, governmental
- **Secondary**: JetBrains Mono for data/codes
- **Hierarchy**: text-3xl, text-xl, text-lg, text-base, text-sm

### Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Tight spacing (p-2, m-2) for compact data
- Standard spacing (p-4, m-4) for cards and sections
- Generous spacing (p-8, m-8) for major layout divisions

### Component Library

**Core Components:**
- **Navigation**: Top bar with agency selector dropdown, clean breadcrumbs
- **Insight Cards**: White/dark surface cards with sentiment indicators, source links
- **Data Display**: Newsletter-style text blocks, date selectors, filtering tabs
- **Forms**: Subscription modal, sharing dialog
- **Actions**: Primary buttons for subscribe/share, secondary for filters

**Key Interactions:**
- Agency filter tabs with active states
- Date picker dropdown
- Insight card hover states revealing action buttons
- Modal overlays for subscription and sharing

### Layout Structure
- **Header**: Agency logo area, navigation, user account
- **Sidebar**: Agency filter (HHS, RMV, General), date selector
- **Main Content**: 3-column insight grid, newsletter-style typography
- **Footer**: Subscription CTA, data source attribution

### Visual Hierarchy
- **Primary**: Agency headlines and insight titles (text-xl, font-semibold)
- **Secondary**: Insight summaries (text-base, leading-relaxed)
- **Tertiary**: Metadata, links, timestamps (text-sm, text-secondary)

### Professional Aesthetics
- Clean card-based layouts with subtle shadows
- Minimal iconography using Heroicons
- High contrast ratios for accessibility
- Consistent 8px border radius for modern feel
- Subtle transitions (150ms) for professional polish

**Images**: No hero images required. Small agency logos and Reddit source icons only. This is a data-focused interface prioritizing readability and quick scanning over visual impact.