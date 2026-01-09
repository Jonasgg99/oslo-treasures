/**
 * DRAWER COMPONENT
 * 
 * The side navigation drawer with menu items and username editor.
 */

import { state } from '../services/state.js';
import { userService } from '../services/user.js';
import { showToast } from '../utils/toast.js';


/**
 * Set up drawer interactions
 */
export function setupDrawer() {
  const menuBtn = document.getElementById('menuBtn');
  const overlay = document.getElementById('drawerOverlay');
  const saveBtn = document.getElementById('saveUsernameBtn');
  const usernameInput = document.getElementById('usernameInput');
  
  // Open drawer
  menuBtn.addEventListener('click', open);
  
  // Close on overlay click
  overlay.addEventListener('click', close);
  
  // Save username
  saveBtn.addEventListener('click', saveUsername);
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveUsername();
  });
  
  // Navigation items
  document.querySelectorAll('.drawer-item[data-view]').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
      close();
    });
  });
  
  // Back buttons
  document.querySelectorAll('.back-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });
}


/**
 * Open the drawer
 */
export function open() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('visible');
  state.ui.isDrawerOpen = true;
  
  // Set current username in input
  document.getElementById('usernameInput').value = userService.getUser().username;
}


/**
 * Close the drawer
 */
export function close() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('visible');
  state.ui.isDrawerOpen = false;
}


/**
 * Toggle drawer open/closed
 */
export function toggle() {
  if (state.ui.isDrawerOpen) {
    close();
  } else {
    open();
  }
}


/**
 * Save the username from the input
 */
async function saveUsername() {
  const input = document.getElementById('usernameInput');
  const newUsername = input.value.trim();
  
  try {
    await userService.setUsername(newUsername);
    showToast('Username saved!', 'success');
    close();
  } catch (error) {
    showToast(error.message, 'error');
  }
}


/**
 * Switch to a different view
 */
export function switchView(view) {
  // Update drawer nav active state
  document.querySelectorAll('.drawer-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  
  // Hide all view panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Show/hide map and bottom sheet
  const mapEl = document.getElementById('map');
  const bottomSheet = document.getElementById('bottomSheet');
  
  if (view === 'map') {
    mapEl.style.display = '';
    bottomSheet.style.display = '';
  } else {
    mapEl.style.display = 'none';
    bottomSheet.style.display = 'none';
    
    // Show the selected view
    if (view === 'leaderboard') {
      document.getElementById('leaderboardView').classList.add('active');
      loadLeaderboard();
    } else if (view === 'profile') {
      document.getElementById('profileView').classList.add('active');
      loadProfile();
    }
  }
  
  state.ui.currentView = view;
}


/**
 * Load and render the leaderboard
 */
async function loadLeaderboard() {
  const { renderLeaderboard } = await import('./Leaderboard.js');
  renderLeaderboard();
}


/**
 * Load and render the profile/finds list
 */
async function loadProfile() {
  const { renderProfile } = await import('./Profile.js');
  renderProfile();
}
