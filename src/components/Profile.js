/**
 * PROFILE COMPONENT
 * 
 * Shows the user's found treasures.
 */

import { state } from '../services/state.js';
import { locationService } from '../services/locations.js';
import { userService } from '../services/user.js';
import { escapeHtml } from '../utils/helpers.js';


/**
 * Render the profile/finds list
 */
export function renderProfile() {
  const listEl = document.getElementById('findsList');
  const foundIds = userService.getFoundIds();
  
  // Get found locations
  const foundLocations = locationService.getFound(foundIds);
  
  if (foundLocations.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No treasures found yet. Get exploring!</p>';
    return;
  }
  
  listEl.innerHTML = foundLocations.map(loc => `
    <div class="finds-item">
      <div class="finds-icon">✓</div>
      <div class="finds-info">
        <div class="finds-name">${escapeHtml(loc.name)}</div>
        <div class="finds-date">${escapeHtml(loc.category || '')}</div>
      </div>
      <div class="finds-points">+${loc.points}</div>
    </div>
  `).join('');
}


/**
 * Get summary stats for the user
 */
export function getStats() {
  const foundIds = userService.getFoundIds();
  const allLocations = locationService.getAll();
  
  return {
    found: foundIds.size,
    total: allLocations.length,
    points: userService.getUser().points,
    percentage: Math.round((foundIds.size / allLocations.length) * 100),
  };
}
