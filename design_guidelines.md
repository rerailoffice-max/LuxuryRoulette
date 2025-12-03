# Design Guidelines: Glamorous Lottery Roulette Application

## Design Approach
**Reference-Based Approach:** Drawing inspiration from high-energy entertainment platforms like **game show interfaces, casino slot machines, and premium event apps** (e.g., prize wheel apps, lottery platforms). The design emphasizes theatrical presentation with clear visual states and dramatic reveals.

**Key Design Principles:**
- Theatrical stage-like presentation with spotlight focus
- High contrast and bold visual hierarchy for crowd visibility
- Generous breathing room around key elements for dramatic impact
- Clear state transitions (Setup → Drawing → Celebration)

---

## Typography System

**Font Families:**
- **Display/Headers:** "Bebas Neue" or "Orbitron" (bold, geometric, futuristic feel) via Google Fonts
- **Body/Input:** "Inter" or "Roboto" (clean, readable)

**Hierarchy:**
- **Winner Display:** 8rem to 12rem (text-8xl to custom), 700-900 weight - dominates entire viewport
- **Roulette Name Display:** 4rem to 6rem (text-6xl to text-7xl), 600-700 weight - center stage during draw
- **Section Headers:** 2rem to 3rem (text-3xl to text-4xl), 600 weight
- **Input Labels/Instructions:** 1.125rem to 1.25rem (text-lg to text-xl), 500 weight
- **Body Text:** 1rem (text-base), 400 weight

**Text Styling:**
- Use uppercase for winner names and primary CTAs for emphasis
- Apply letter-spacing (tracking-wide/wider) on display text for luxury feel
- Center-align dramatic reveals; left-align functional inputs

---

## Layout System

**Spacing Primitives:** Tailwind units of **4, 8, 12, 16, 24** (p-4, p-8, m-12, h-16, gap-24)
- Tight spacing (4-8) for related form elements
- Medium spacing (12-16) for section padding
- Generous spacing (24) for major visual breaks between app states

**Viewport Strategy:**
- **Setup State:** Natural height with centered content container (max-w-4xl), py-12
- **Drawing/Celebration States:** Full viewport (min-h-screen) to create immersive theater experience
- Container padding: px-4 (mobile), px-8 (desktop)

**Grid System:**
- Single-column layout throughout for focus
- Input area: Full-width textarea with generous padding (p-6)
- Action buttons: Centered with max-width constraints (max-w-xs to max-w-sm)

---

## Component Library

### A. Input Setup Section
**Name Input Container:**
- Large textarea (min-h-64 or h-80) with clear borders
- Prominent label with instructions: "Paste participant names (one per line)"
- Live participant count display above textarea
- Clear/Reset button positioned at top-right of input area

**Start Button:**
- Extra-large touch target (py-6 px-16, min-w-64)
- Bold uppercase text (text-2xl)
- Positioned center-screen below input with mt-12 spacing
- Pulsing glow effect to draw attention (animate-pulse variant)

### B. Roulette Display
**Name Carousel:**
- Single name displayed in massive typography (text-6xl to text-8xl)
- Centered vertically and horizontally in viewport
- Contained within max-w-4xl for readability
- Subtle scale/blur transition between name changes during spin

**State Indicators:**
- Top bar showing "Drawing..." status with animated ellipsis
- Participant count badge (e.g., "24 participants") in corner

### C. Winner Celebration Screen
**Winner Card:**
- Full-screen takeover with name at absolute center
- Trophy/star icon above name (4rem to 6rem size from icon library)
- Decorative frame or border around winner name (p-12 to p-16)
- "Winner!" or "Congratulations!" subtitle below name (text-3xl)

**Action Buttons:**
- "Draw Again" primary button (large, py-4 px-12)
- "Back to Setup" secondary button (smaller, outlined style)
- Positioned at bottom-center with gap-4 between buttons

### D. Audio Controls
- Small mute/unmute toggle button fixed to top-right corner
- Icon-only (speaker icon from Heroicons), 12×12 touch target
- Persists across all states

---

## Animation Principles

**Strategic Use Only:**
- **Roulette Spin:** Easing curve from fast → slow (cubic-bezier for deceleration), 3-5 second total duration
- **Confetti:** Trigger canvas-confetti on winner reveal, 2-3 second burst
- **Winner Entrance:** Scale-up + fade-in (0.3s duration) for dramatic reveal
- **Button Pulse:** Subtle continuous pulse on Start button only
- Avoid: Unnecessary hover effects, background animations, distracting parallax

---

## Visual Assets

### Icons
**Library:** Heroicons (via CDN)
- Trophy/award icons for winner state
- User/users icons for participant count
- Volume icons for audio control
- Refresh icon for "Draw Again"

**Icon Sizing:** 
- Primary actions: w-8 h-8 to w-12 h-12
- Status indicators: w-6 h-6
- Small UI controls: w-5 h-5

### Images
**Hero/Background Treatment:**
- No traditional hero image needed
- Background: Solid dark base with subtle radial gradient (dark center to slightly lighter edges)
- Optional: Faint geometric pattern overlay (dots, hexagons) at 5-10% opacity for texture

### Audio Assets
- Placeholder comments for drum roll and fanfare URLs
- Use Web Audio API with user-interaction unlock
- Ensure audio files are lightweight (< 500KB each)

---

## Responsive Breakpoints

**Mobile (< 768px):**
- Winner text: text-6xl to text-7xl
- Roulette text: text-4xl to text-5xl
- Button text: text-xl
- Reduced spacing: py-8, px-4

**Desktop (≥ 768px):**
- Full typographic scale as specified
- Wider containers: max-w-4xl to max-w-6xl
- Generous spacing: py-12 to py-24

---

## Accessibility Notes
- High contrast between text and backgrounds (WCAG AAA for winner display)
- Focus indicators on all interactive elements (ring-4 outline)
- Clear button labels (aria-label for icon-only buttons)
- Keyboard navigation support (Enter to start draw, Escape to reset)