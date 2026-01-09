/**
 * EVENT HANDLING
 * 
 * Sets up global event listeners and keyboard shortcuts.
 */

import { state } from '../services/state.js';
import { close as closeDrawer } from '../components/Drawer.js';
import { collapse as collapseSheet } from '../components/BottomSheet.js';
import { centerOnUser } from '../components/Map.js';
import { showToast } from './toast.js';


/**
 * Set up global event listeners
 */
export function setupEventListeners() {
  // Escape key closes drawer/sheet
  document.addEventListener('keydown', handleKeydown);
  
  // Handle back button on mobile
  window.addEventListener('popstate', handleBackButton);
  
  // Handle visibility change (app going to background)
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Prevent pull-to-refresh on mobile
  document.body.addEventListener('touchmove', preventOverscroll, { passive: false });
  
  // Locate me button
  document.getElementById('locateBtn').addEventListener('click', handleLocateClick);
}


/**
 * Handle locate button click
 */
function handleLocateClick() {
  if (state.gps.currentPosition) {
    centerOnUser();
  } else {
    showToast('Waiting for GPS...', 'error');
  }
}


/**
 * Handle keyboard shortcuts
 */
function handleKeydown(e) {
  // Escape key
  if (e.key === 'Escape') {
    if (state.ui.isDrawerOpen) {
      closeDrawer();
    } else if (state.ui.isBottomSheetExpanded) {
      collapseSheet();
    }
  }
}


/**
 * Handle mobile back button
 */
function handleBackButton(e) {
  if (state.ui.isDrawerOpen) {
    e.preventDefault();
    closeDrawer();
  } else if (state.ui.currentView !== 'map') {
    e.preventDefault();
    import('../components/Drawer.js').then(({ switchView }) => {
      switchView('map');
    });
  }
}


/**
 * Handle app going to background/foreground
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // App went to background
    console.log('App in background');
  } else {
    // App came to foreground
    console.log('App in foreground');
    // Could refresh data here
  }
}


/**
 * Prevent pull-to-refresh on mobile (can interfere with map)
 */
function preventOverscroll(e) {
  // Only prevent if at top of page and pulling down
  if (window.scrollY === 0 && e.touches[0].clientY > 0) {
    // Allow if touching the map or bottom sheet
    const target = e.target;
    if (target.closest('#map') || target.closest('.bottom-sheet')) {
      return;
    }
  }
}