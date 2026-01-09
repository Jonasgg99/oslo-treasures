/**
 * STATE MANAGEMENT
 * 
 * Centralized application state. All components read from and write to this.
 * 
 * In a larger app, you might use a library like Zustand or Redux.
 * For this size, a simple object with getter/setter functions works well.
 * 
 * Benefits of centralized state:
 * - Easy to debug (just log the state object)
 * - Clear data flow
 * - Components stay in sync
 */

/**
 * The main state object
 * All app data lives here
 */
export const state = {
  // Supabase client instance
  supabase: null,
  
  // Leaflet map instance
  map: null,
  
  // Current user
  user: {
    id: null,
    username: 'Explorer',
    points: 0,
  },
  
  // All treasure locations
  locations: [],
  
  // IDs of locations the user has found
  foundLocationIds: new Set(),
  
  // Currently selected location (when marker is tapped)
  selectedLocation: null,
  
  // GPS tracking state
  gps: {
    watchId: null,
    currentPosition: null,
    userMarker: null,
    accuracyCircle: null,
  },
  
  // UI state
  ui: {
    currentView: 'map',  // 'map', 'leaderboard', 'profile'
    isDrawerOpen: false,
    isBottomSheetExpanded: false,
  },
};


/**
 * Subscribe to state changes (simple pub/sub)
 * Components can listen for updates and re-render
 */
const listeners = new Set();

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);  // Return unsubscribe function
}

export function notifyListeners() {
  listeners.forEach(callback => callback(state));
}


/**
 * Helper to update state and notify listeners
 */
export function updateState(path, value) {
  const keys = path.split('.');
  let current = state;
  
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  notifyListeners();
}


/**
 * Reset state to initial values (useful for testing)
 */
export function resetState() {
  state.user = { id: null, username: 'Explorer', points: 0 };
  state.locations = [];
  state.foundLocationIds = new Set();
  state.selectedLocation = null;
  state.ui = { currentView: 'map', isDrawerOpen: false, isBottomSheetExpanded: false };
  notifyListeners();
}
