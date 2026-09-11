# Color Switch Rush — Design Direction

## Three possible directions

### Theme Name: Kinetic Arcade Tunnel
Very dark, high-contrast, saturated, and fast, with rotating color gates, impact flashes, and a visual language built around speed and precision.
Probability: 0.07

### Theme Name: Prism Observatory
A calmer premium sci-fi direction using glassy rings, measured motion, and a museum-like interface that makes the color puzzle feel precise and collectible.
Probability: 0.04

### Theme Name: Candy Voltage
A playful toy-box direction with soft 3D color blocks, bold stickers, and bright arcade typography designed to feel friendly before the difficulty ramps up.
Probability: 0.02

## Selected direction: Kinetic Arcade Tunnel

### Design Movement
Neon arcade minimalism with kinetic sports-broadcast overlays: the tunnel is the stage, the gate is the obstacle, and every successful match produces a readable burst of momentum.

### Core Principles
The game should communicate state instantly through color, scale, and motion. Every interaction should feel fast but intentional. The tunnel remains visually deep while the UI stays legible on tiny portrait screens. Polish must improve mastery and feedback without adding monetization, external links, or distracting menus.

### Color Philosophy
Deep navy is the quiet space that makes the six gate colors feel electric. Cyan is the signature action color for confirmation and readiness; hot coral signals danger and failure; ultraviolet marks combo energy; gold marks records and daily achievement. Color is not decoration: it is the primary gameplay language, so every accent must preserve contrast and remain meaningful.

### Layout Paradigm
Use a full-bleed playfield with HUD elements pinned to safe inset zones rather than a conventional centered dashboard. Menu and tutorial cards should float over the tunnel with asymmetric offsets and clear vertical rhythm. Gameplay controls should remain reachable from either hand in portrait and never depend on a fixed resolution.

### Signature Elements
The design uses a six-color spectrum strip to explain switching, a thin segmented progress rail for upcoming gates, and a compact status stamp for Daily Challenge/RUSH states. Crash feedback uses a brief chromatic impact frame rather than a generic modal animation.

### Interaction Philosophy
Inputs are immediate: tap, click, or Space changes the ball once, with no debounce delay that could feel like a missed command. Pause and tutorial surfaces are explicit and reversible. Optional vibration is off by default and must be user-toggleable if enabled.

### Animation
Use short ease-out transitions for UI, smooth gate rotation, and additive particles for pass/crash moments. RUSH mode may intensify glow and speed, but motion must remain readable. Honor `prefers-reduced-motion` by reducing camera shake, particle density, and non-essential UI movement while preserving gameplay timing.

### Typography System
Use a condensed display face for score, labels, and the wordmark, paired with a clean geometric sans for explanatory copy. Headings are uppercase and tightly tracked; instructional text uses sentence case with generous line height. The repository README mirrors this hierarchy with a strong title, concise feature table, and clear setup commands.

### Brand Essence
Color Switch Rush is a one-thumb color-matching tunnel run for players who want a fast, replayable test of reaction and pattern recognition. Personality: electric, focused, relentless.

### Brand Voice
Headlines and calls to action are short, active, and specific. Microcopy should sound like a coach at the edge of the track, never like generic SaaS copy.

Example lines: “Match fast. Push farther.” and “The tunnel does not slow down.”

### Wordmark & Logo
Use the existing typographic title treatment with a six-segment ring mark: a broken circular loop whose missing segment points forward, suggesting both a gate and a rush arrow. Do not introduce a default-font text logo as the only brand mark.

### Signature Brand Color
Electric cyan `#16D9FF`, reserved for primary actions, successful matches, readiness states, and Playables-safe confirmation surfaces.

## Implementation scope for this pass

The upgrade will stay non-monetized. It will add stronger run feedback through a RUSH meter/fever state, a compact upcoming-gate rail, a distinct pause overlay, optional user-controlled haptic feedback, reduced-motion handling, safer responsive HUD positioning, Playables-mode suppression of local-only sharing controls, and a polished repository README with Playables testing notes. Existing daily challenge, screen shake, tutorial, sound, score persistence, and rewarded-ad adapter code will remain available, but no ad or monetization UI will be added or promoted in the game experience.
