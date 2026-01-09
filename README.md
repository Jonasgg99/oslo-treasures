# Oslo Treasures - Setup Guide

A modular Vite-based treasure hunting app for exploring Oslo.

---

## Project Structure

```
oslo-treasures/
├── public/                 # Static assets (copied as-is)
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
├── src/
│   ├── main.js             # Entry point - bootstraps the app
│   ├── config.js           # Configuration (Supabase credentials, etc.)
│   ├── components/         # UI components
│   │   ├── App.js          # Main app shell
│   │   ├── Map.js          # Leaflet map handling
│   │   ├── BottomSheet.js  # Location details panel
│   │   ├── Drawer.js       # Navigation drawer
│   │   ├── Leaderboard.js  # Leaderboard view
│   │   └── Profile.js      # User's finds view
│   ├── services/           # Business logic
│   │   ├── state.js        # Centralized state management
│   │   ├── supabase.js     # Database operations
│   │   ├── user.js         # User management
│   │   ├── locations.js    # Location management
│   │   └── gps.js          # GPS tracking
│   ├── utils/              # Helper functions
│   │   ├── helpers.js      # General utilities
│   │   ├── toast.js        # Toast notifications
│   │   └── events.js       # Event handling
│   ├── data/               # Static data
│   │   └── locations.js    # Demo locations
│   └── styles/             # CSS modules
│       ├── main.css        # Entry point (imports others)
│       ├── variables.css   # CSS custom properties
│       ├── reset.css       # Browser reset
│       ├── layout.css      # Main layout components
│       ├── components.css  # Smaller UI components
│       ├── map.css         # Map and marker styles
│       └── animations.css  # Keyframe animations
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ installed ([download](https://nodejs.org/))
- A code editor (VS Code recommended)
- A terminal

### Installation

1. **Open terminal in the project folder:**
   ```bash
   cd oslo-treasures
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   The terminal will show a URL like `http://localhost:3000`
   
That's it! The app runs in demo mode with 12 built-in Oslo locations.

---

## Connecting to Supabase

For persistent data and leaderboards, set up Supabase:

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project"
3. Choose a name, set a database password, select a region
4. Wait ~2 minutes for setup

### Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Run this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  hint TEXT,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  points INTEGER DEFAULT 10,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkins table
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  UNIQUE(user_id, location_id)
);

-- Indexes
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_location ON checkins(location_id);
CREATE INDEX idx_users_points ON users(total_points DESC);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Locations viewable by everyone" ON locations FOR SELECT USING (true);
CREATE POLICY "Users viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update themselves" ON users FOR UPDATE USING (true);
CREATE POLICY "Checkins viewable by everyone" ON checkins FOR SELECT USING (true);
CREATE POLICY "Anyone can check in" ON checkins FOR INSERT WITH CHECK (true);
```

### Step 3: Add Demo Locations

Run this in SQL Editor:

```sql
INSERT INTO locations (name, description, hint, latitude, longitude, points, difficulty, category) VALUES
('The Tiger', 'Oslo''s iconic bronze tiger', 'Feline guardian at the station', 59.9110, 10.7503, 10, 'easy', 'landmark'),
('Vigeland''s Monolith', '14-meter sculpture in Frognerparken', 'Tower of intertwined figures', 59.9272, 10.7016, 15, 'easy', 'art'),
('Akershus Fortress', 'Medieval castle', 'Guarding Oslo since 1299', 59.9075, 10.7367, 15, 'easy', 'historic'),
('Ekebergparken Viewpoint', 'Classic fjord panorama', 'Sculpture park meets city view', 59.8997, 10.7627, 20, 'medium', 'viewpoint'),
('Damstredet', 'Oldest preserved wooden houses', 'Behind Gamle Aker church', 59.9227, 10.7471, 25, 'medium', 'hidden'),
('Oslo Opera House Roof', 'Walk on the iconic roof', 'Iceberg in Bjørvika', 59.9073, 10.7531, 15, 'easy', 'landmark'),
('Mathallen Food Hall', 'Gourmet food market', 'By the Akerselva river', 59.9226, 10.7527, 15, 'easy', 'food'),
('Grefsenkollen', 'City and forest viewpoint', 'Where city meets marka', 59.9633, 10.8097, 35, 'hard', 'viewpoint'),
('The Royal Palace', 'Monarch''s residence', 'Guard change at 1:30 PM', 59.9169, 10.7276, 10, 'easy', 'landmark'),
('Aker Brygge Pier', 'Waterfront promenade', 'Dining by the fjord', 59.9111, 10.7295, 10, 'easy', 'landmark'),
('Frognerseteren', 'Nordmarka entrance', 'End of T-bane line 1', 59.9833, 10.6833, 40, 'hard', 'nature'),
('Huk Beach', 'City beach on Bygdøy', 'Summer fjord paradise', 59.8936, 10.6736, 30, 'medium', 'nature');
```

### Step 4: Configure the App

1. Go to Supabase **Settings → API**
2. Copy the **Project URL** and **anon public key**
3. Open `src/config.js` and update:

```javascript
export const CONFIG = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...',
  // ... rest stays the same
};
```

4. Restart the dev server (`npm run dev`)

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

---

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized, minified files.

### Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Your app is live!

### Deploy to Netlify

1. Build: `npm run build`
2. Drag `dist/` folder to Netlify dashboard
3. Done!

---

## Making Changes

### Adding a New Location

Edit `src/data/locations.js` or add via Supabase dashboard.

### Changing Colors

Edit `src/styles/variables.css`:

```css
:root {
  --color-primary: #e94560;  /* Change this */
  --color-bg: #1a1a2e;
  /* etc */
}
```

### Adding a New View/Page

1. Create component in `src/components/NewView.js`
2. Add navigation item in `src/components/App.js`
3. Add route handling in `src/components/Drawer.js`
4. Add styles in `src/styles/components.css`

### Adding a New Service

1. Create file in `src/services/newservice.js`
2. Import and use in components that need it
3. If it needs state, add to `src/services/state.js`

---

## Testing on Mobile

1. Find your computer's IP address
2. Start dev server: `npm run dev`
3. On your phone (same WiFi), open: `http://YOUR_IP:3000`

For GPS testing:
- Chrome DevTools → Sensors → Override location
- Or just go outside!

---

## Troubleshooting

### "Module not found" errors
Run `npm install` again.

### Map not loading
Check internet connection. OpenStreetMap tiles need network access.

### GPS not working
- Check browser permissions
- HTTPS is required for GPS on mobile (except localhost)
- Try going outside - GPS is unreliable indoors

### Changes not appearing
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or restart dev server

---

## Next Steps

Ideas for expanding the app:

1. **Photo verification** - Require photo proof of visit
2. **Achievements** - Badges for completing categories
3. **Events** - Time-limited bonus treasures
4. **Social features** - Friend leaderboards, sharing
5. **Custom themes** - Let users pick color schemes
6. **Offline mode** - Service worker for offline access

Good luck! 🗺️💎
