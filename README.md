# CampusRide

**Find your route. Find your people. Share the journey.**

CampusRide is a calm, minimal student-to-student shared travel web app built around one core question:

> *“Who from my campus is going in the same direction around the same time?”*

---

## Core Flow

1. **Landing** — Overview of the problem, 3-step workflow, and primary **Plan a ride** entry point.
2. **Plan a Ride** — Enter pickup area, destination, travel date, approximate time window, travel mode, and preferred group size with inline validation.
3. **Matches** — View ranked compatible trips with match score (`%`), date/time window, seats left, and estimated per-person cost, or create a new group if none match.
4. **Group** — Inspect confirmed members, remaining seats, total estimated fare, animated live per-person split (safe for 0 members), join/leave toggle, and an in-memory group chat panel.
5. **Profile** — View any group member's home city, travel preferences, and communication comfort, or update your own profile.
6. **Personalize Appearance** — Use the sliders icon in the top-right header to customize Light/Dark mode, accent colour (curated presets or any custom colour), background tone, font size (`S`–`XL`), and font style (`Clean Sans`, `Geometric`, `Editorial`, `Mono`), saved automatically in `localStorage`.

---

## Scope Note

Estimates only. CampusRide does not book cabs, process payments, track live GPS, or verify identity. All student profiles, trips, and chat messages run on local in-memory mock data (`src/data/mockData.js`).

---

## How to Run

### Option 1: Static server with Python (zero dependencies)

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 2: Vite dev server (if Node.js is installed)

```bash
npm install && npm run dev
```

Then open the local URL printed by Vite.

---

## Project Structure

```text
├── index.html              # App shell, header, footer
├── styles.css              # Design system, light/dark themes, responsive layout
├── package.json            # Optional Vite dev/build scripts
├── README.md
├── assets/
│   └── images/             # Clean minimalist SVG illustrations (hero & 3 steps)
└── src/
    ├── app.js              # View router, navigation, theme toggle
    ├── data/
    │   └── mockData.js     # 10 seeded students, 9 trips, area clusters
    ├── state/
    │   └── store.js        # In-memory state and group/chat mutations
    ├── utils/
    │   ├── dom.js          # HTML escaping helper
    │   ├── matching.js     # Route/date/time/seat scoring & safe fare split
    │   └── motion.js       # Reduced-motion-safe number interpolation
    └── views/
        ├── landing.js      # Screen 1: Landing
        ├── planRide.js     # Screen 2: Plan a Ride
        ├── matches.js      # Screen 3: Matches + empty state
        ├── group.js        # Screen 4: Group + live fare split + chat
        └── profile.js      # Screen 5: Basic student profile
```
