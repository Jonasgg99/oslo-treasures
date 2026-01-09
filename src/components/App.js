/**
 * APP COMPONENT
 * 
 * Renders the main application shell/structure.
 * This is the HTML skeleton that other components populate.
 */

export function renderApp() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="user-info">
        <span class="username" id="usernameDisplay">Explorer</span>
        <span class="points" id="pointsDisplay">0 pts</span>
      </div>
      <button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>
    </header>

    <!-- Map Container -->
    <div id="map"></div>

    <!-- Bottom Sheet -->
    <div class="bottom-sheet" id="bottomSheet">
      <div class="sheet-handle"></div>
      <div class="sheet-content">
        <h2 class="location-name" id="locationName">Tap a treasure to begin</h2>
        <p class="location-hint" id="locationHint"></p>
        <div class="location-meta">
          <span class="difficulty" id="locationDifficulty"></span>
          <span class="points-value" id="locationPoints"></span>
        </div>
        <button class="checkin-btn" id="checkinBtn" disabled>
          Select a location
        </button>
        <p class="distance-info" id="distanceInfo"></p>
      </div>
    </div>

    <!-- Drawer -->
    <div class="drawer" id="drawer">
      <div class="drawer-header">
        <h2>Oslo Treasures</h2>
      </div>
      <nav class="drawer-nav">
        <button class="drawer-item active" data-view="map">🗺️ Map</button>
        <button class="drawer-item" data-view="leaderboard">🏆 Leaderboard</button>
        <button class="drawer-item" data-view="profile">📍 My Finds</button>
      </nav>
      <div class="drawer-divider"></div>
      <div class="drawer-section">
        <label for="usernameInput">Your name</label>
        <input type="text" id="usernameInput" placeholder="Enter username" maxlength="20">
        <button class="save-username-btn" id="saveUsernameBtn">Save</button>
      </div>
    </div>
    <div class="drawer-overlay" id="drawerOverlay"></div>

    <!-- Leaderboard View -->
    <div class="view-panel" id="leaderboardView">
      <div class="view-header">
        <button class="back-btn" data-view="map">← Back</button>
        <h2>Leaderboard</h2>
      </div>
      <div class="leaderboard-list" id="leaderboardList">
        <p class="loading">Loading...</p>
      </div>
    </div>

    <!-- Profile View -->
    <div class="view-panel" id="profileView">
      <div class="view-header">
        <button class="back-btn" data-view="map">← Back</button>
        <h2>My Finds</h2>
      </div>
      <div class="finds-list" id="findsList">
        <p class="empty-state">No treasures found yet. Get exploring!</p>
      </div>
    </div>

    <!-- GPS Status Overlay -->
    <div class="gps-status" id="gpsStatus">
      <div class="spinner"></div>
      <span>Getting your location...</span>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>
  `;
}
