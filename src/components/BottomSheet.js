/**
 * BOTTOM SHEET COMPONENT
 * 
 * The slide-up panel that shows location details and check-in button.
 */

import { state } from '../services/state.js';
import { locationService } from '../services/locations.js';
import { userService } from '../services/user.js';
import { gpsService, formatDistance } from '../services/gps.js';
import { CONFIG } from '../config.js';
import { showToast } from '../utils/toast.js';
import { updateMarker } from './Map.js';

// Lock to prevent collapse during drag
let dragLock = false;


/**
 * Set up bottom sheet interactions
 */
export function setupBottomSheet() {
  const sheet = document.getElementById('bottomSheet');
  const checkinBtn = document.getElementById('checkinBtn');
  
  // Drag anywhere on sheet to expand/collapse
  setupDragBehavior(sheet);
  
  // Check-in button
  checkinBtn.addEventListener('click', handleCheckin);
}


/**
 * Set up drag behavior for the sheet
 */
function setupDragBehavior(sheet) {
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  
  // Listen on entire sheet
  sheet.addEventListener('touchstart', (e) => {
    // Don't interfere with button taps
    if (e.target.closest('button')) return;
    
    isDragging = true;
    dragLock = true;
    startY = e.touches[0].clientY;
    currentY = startY;
    sheet.style.transition = 'none';
  }, { passive: true });
  
  sheet.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const isExpanded = sheet.classList.contains('expanded');
    
    // Calculate new position
    let translateY;
    if (isExpanded) {
      // When expanded, only allow dragging down
      translateY = Math.max(0, deltaY);
    } else {
      // When collapsed, allow dragging up from peek position
      const peekOffset = sheet.offsetHeight - 100;
      translateY = Math.max(0, Math.min(peekOffset, peekOffset + deltaY));
    }
    
    sheet.style.transform = `translateY(${translateY}px)`;
  }, { passive: true });
  
  sheet.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    
    const deltaY = currentY - startY;
    const isExpanded = sheet.classList.contains('expanded');
    const dragThreshold = 50; // Minimum drag distance to trigger change
    
    sheet.style.transition = '';
    sheet.style.transform = '';
    
    if (isExpanded) {
      // If expanded and dragged down enough, collapse
      if (deltaY > dragThreshold) {
        sheet.classList.remove('expanded');
        state.ui.isBottomSheetExpanded = false;
      }
    } else {
      // If collapsed and dragged up enough, expand
      if (deltaY < -dragThreshold) {
        sheet.classList.add('expanded');
        state.ui.isBottomSheetExpanded = true;
      }
    }
    
    // Release lock after a delay
    setTimeout(() => {
      dragLock = false;
    }, 200);
  });
}


/**
 * Show details for a location
 */
export function showLocationDetails(location) {
  document.getElementById('locationName').textContent = location.name;
  document.getElementById('locationHint').textContent = location.hint || location.description;
  
  const difficultyEl = document.getElementById('locationDifficulty');
  difficultyEl.textContent = location.difficulty;
  difficultyEl.className = `difficulty ${location.difficulty}`;
  
  document.getElementById('locationPoints').textContent = `${location.points} points`;
  
  // Check if already found
  const isFound = userService.hasFound(location.id);
  const checkinBtn = document.getElementById('checkinBtn');
  
  if (isFound) {
    checkinBtn.textContent = '✓ Found';
    checkinBtn.classList.add('found');
    checkinBtn.disabled = true;
    document.getElementById('distanceInfo').textContent = '';
  } else {
    checkinBtn.classList.remove('found');
    updateCheckinButton();
  }
  
  // Expand the sheet
  expand();
}


/**
 * Update the check-in button based on GPS distance
 */
export function updateCheckinButton() {
  const location = locationService.getSelected();
  const checkinBtn = document.getElementById('checkinBtn');
  const distanceInfo = document.getElementById('distanceInfo');
  
  if (!location) {
    checkinBtn.textContent = 'Select a location';
    checkinBtn.disabled = true;
    distanceInfo.textContent = '';
    return;
  }
  
  // Already found
  if (userService.hasFound(location.id)) {
    return;
  }
  
  // No GPS yet
  if (!gpsService.getCurrentPosition()) {
    checkinBtn.textContent = 'Waiting for GPS...';
    checkinBtn.disabled = true;
    distanceInfo.textContent = 'Enable location to check in';
    distanceInfo.classList.remove('in-range');
    return;
  }
  
  // Calculate distance
  const distance = gpsService.getDistanceTo(location.latitude, location.longitude);
  const distanceText = formatDistance(distance) + ' away';
  
  if (distance <= CONFIG.CHECKIN_RADIUS_METERS) {
    checkinBtn.textContent = 'Check in now!';
    checkinBtn.disabled = false;
    distanceInfo.textContent = `You're here! ${distanceText}`;
    distanceInfo.classList.add('in-range');
  } else {
    checkinBtn.textContent = 'Get closer to check in';
    checkinBtn.disabled = true;
    distanceInfo.textContent = distanceText;
    distanceInfo.classList.remove('in-range');
  }
}


/**
 * Handle check-in button click
 */
async function handleCheckin() {
  const location = locationService.getSelected();
  if (!location) return;
  
  // Verify distance again
  if (!gpsService.isInRange(location)) {
    showToast('Too far away! Get closer.', 'error');
    return;
  }
  
  const checkinBtn = document.getElementById('checkinBtn');
  checkinBtn.disabled = true;
  checkinBtn.textContent = 'Checking in...';
  
  try {
    const coords = gpsService.getCurrentPosition()?.coords;
    const points = await userService.checkin(location, coords);
    
    // Update UI
    checkinBtn.textContent = '✓ Found';
    checkinBtn.classList.add('found');
    document.getElementById('distanceInfo').textContent = '';
    
    // Update marker on map
    updateMarker(location);
    
    showToast(`+${points} points! 🎉`, 'success');
    console.log(`✅ Checked in at ${location.name}`);
    
  } catch (error) {
    console.error('Check-in failed:', error);
    showToast(error.message || 'Check-in failed. Try again.', 'error');
    updateCheckinButton();
  }
}


/**
 * Expand the bottom sheet
 */
export function expand() {
  document.getElementById('bottomSheet').classList.add('expanded');
  state.ui.isBottomSheetExpanded = true;
}


/**
 * Collapse the bottom sheet
 */
export function collapse() {
  // Don't collapse if user is dragging the sheet
  if (dragLock) return;
  
  document.getElementById('bottomSheet').classList.remove('expanded');
  state.ui.isBottomSheetExpanded = false;
}