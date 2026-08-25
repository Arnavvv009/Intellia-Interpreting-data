# Intellia — Interpreting Data (Data Handling / Statistics)

A full rebuild of the Intellia learning module — same UI/UX, layout, gamification
architecture, and hybrid audio-narration pipeline as the original 3D Shapes module —
retargeted to the **Data Handling (Statistics): Interpreting Data** topic (Picture
Graphs, Bar Graphs, Tables, and Line Graphs).

## Quick Start

```bash
npm install
npm run dev
```

## Audio Narration Setup (ElevenLabs)

Your ElevenLabs API key is already saved in `.env.local`:

```
VITE_ELEVENLABS_API_KEY=sk_7ef27dccb32144843f8ee5068dfd4223a85326c56c14b00a
```

⚠️ **Important:** this sandbox could not reach `api.elevenlabs.io` (outbound network
here is restricted to package registries only), so the pre-generated `.mp3` files
have **not** been created yet. `src/utils/audioMap.js` currently exports an empty map.

To generate the offline narration files on your own machine (with internet access):

```bash
npm install
node scripts/generate_audio.js
```

This will:
1. Call the ElevenLabs API for every fixed narration line (Wonder question, 4 Story
   slides, 4 Simulate station intros, Play-phase praise lines, Reflect prompts).
2. Save the resulting `.mp3` files into `public/assets/audio/`.
3. Regenerate `src/utils/audioMap.js` with the text → file mappings.

Until you run this, the app will still narrate everything — it just falls back to
requesting audio from ElevenLabs live (or the browser's built-in speech synthesis if
that fails), exactly as described in the pipeline doc. Once you've generated the
static files, playback becomes instant with zero latency.

Run `node scripts/clean_audio.js` any time to delete orphaned `.mp3` files that are
no longer referenced in `audioMap.js`.

## What's the same as the original module
- Exact same phase architecture: Wonder → Story → Simulate → Play → Reflect
- Exact same `App.css` design system (colors, cards, buttons, nav, HUD, num-pad,
  matching game, sandbox toggles, etc.) — only additive CSS was appended for the
  new chart visuals
- Same gamification: XP, streak, hearts/lives, hints, stars, 10 unlockable worlds,
  badges, localStorage session persistence
- Same audio engine (`src/utils/audio.js`, `src/hooks/useAudio.js`) and hybrid
  pre-generation + dynamic-fallback pipeline

## What's different (content only)
- **Topic:** Interpreting Data — Picture Graphs, Bar Graphs, Tables, Line Graphs
  (replacing 3D Shapes — Cube, Cuboid, Cone, Sphere)
- **Mascot:** Dexter the Data-Bot (same robot visual system, new name)
- **Story panel images:** 4 original hand-built cartoon-style SVG illustrations at
  a 20:8 aspect ratio (`src/components/phases/StoryPhase.jsx`)
- **Simulate stations:** Graph Explorer, Data Counter, Match the Graph, Trend
  Sandbox (mechanically identical to the original 4 stations, retargeted content)
- **Play worlds:** 10 Data Worlds with 100 total questions in `src/data/questionBank.js`
- **Data model:** `src/data/chartData.js` replaces `shapeData.js`
- **Chart rendering:** `src/components/shared/ChartViewer.jsx` replaces
  `Shape3D.jsx` / `ShapeRotator.jsx` (renders pictographs, bar graphs, tables, and
  an animated SVG line graph instead of CSS 3D solids)
