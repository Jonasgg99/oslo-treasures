/**
 * MAIN ENTRY POINT
 * 
 * This is where the app starts. It:
 * 1. Imports all necessary modules
 * 2. Initializes services (database, GPS)
 * 3. Renders the initial UI
 * 4. Sets up event listeners
 */

// Styles
import './styles/main.css';

// Services
import { initSupabase } from './services/supabase.js';
import { gpsService } from './services/gps.js';
import { userService } from './services/user.js';

// Components
import { renderApp } from './components/App.js';
import { initMap, addLocationMarkers } from './components/Map.js';
import { setupDrawer } from './components/Drawer.js';
import { setupBottomSheet } from './components/BottomSheet.js';
import { setupEventListeners } from './utils/events.js';

// Data
import { locationService } from './services/locations.js';

// State management
import { state } from './services/state.js';


/**
 * Initialize the entire application
 */
async function init() {
  console.log('🗺️ Oslo Treasures starting...');
  
  try {
    // Step 1: Render the app shell (HTML structure)
    renderApp();
    
    // Step 2: Initialize Supabase client
    initSupabase();
    
    // Step 3: Load or create user
    await userService.init();
    
    // Step 4: Set up the map
    initMap();
    
    // Step 5: Load locations from database
    await locationService.loadLocations();
    
    // Step 6: Load user's check-ins
    await userService.loadCheckins();
    
    // Step 7: Add markers to map
    addLocationMarkers();
    
    // Step 8: Set up UI components
    setupDrawer();
    setupBottomSheet();
    setupEventListeners();
    
    // Step 9: Start GPS tracking
    gpsService.startTracking();
    
    // Step 10: Update UI with initial state
    userService.updateUI();
    
    console.log('✅ App initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    showError('Failed to load app. Please refresh the page.');
  }
}


/**
 * Show a fatal error message
 */
function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 20px;
      text-align: center;
      background: #1a1a2e;
      color: #eee;
      font-family: system-ui, sans-serif;
    ">
      <div>
        <h1 style="color: #e94560;">😕 Oops!</h1>
        <p>${message}</p>
        <button onclick="location.reload()" style="
          margin-top: 20px;
          padding: 12px 24px;
          background: #e94560;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        ">Refresh</button>
      </div>
    </div>
  `;
}


// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
