# Oslo Treasures

A mobile-first treasure hunting app for exploring Oslo on foot. Find hidden treasures at real locations around the city, earn points, and compete on the leaderboard.

![Mobile PWA](https://img.shields.io/badge/mobile-PWA-blue)
![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🗺️ Interactive map with treasure locations
- 📍 GPS-based check-ins (must be within 50m)
- 🏆 Leaderboard to compete with other explorers
- 📱 Mobile-first PWA (installable on phone)
- 🌙 Dark theme

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:3000` and runs in demo mode with 12 built-in Oslo locations.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── components/    # UI components (Map, Drawer, BottomSheet)
├── services/      # Business logic (GPS, user, database)
├── utils/         # Helper functions
├── styles/        # CSS modules
└── data/          # Demo locations
```

## Tech Stack

- **Vite** — Build tool
- **Leaflet** — Maps
- **Supabase** — Backend (optional)
- **Vanilla JS** — No framework

## License

MIT
