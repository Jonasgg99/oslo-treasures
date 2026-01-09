/**
 * MAP COMPONENT
 * 
 * Handles the Leaflet map: initialization, markers, interactions.
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CONFIG } from '../config.js';
import { state } from '../services/state.js';
import { locationService } from '../services/locations.js';
import { userService } from '../services/user.js';
import { showLocationDetails, collapse } from './BottomSheet.js';


/**
 * Initialize the Leaflet map
 */
export function initMap() {
  // Create the map
  state.map = L.map('map', {
    center: CONFIG.DEFAULT_CENTER,
    zoom: CONFIG.DEFAULT_ZOOM,
    doubleClickZoom: false,
    zoomAnimation: true,
    zoomControl: false,
  });
  
  // Add zoom controls in top-right
  L.control.zoom({ position: 'topright' }).addTo(state.map);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: CONFIG.MAX_ZOOM,
  }).addTo(state.map);
  
  // Collapse bottom sheet when user interacts with map
  state.map.on('dragstart', collapse);
  state.map.on('zoomstart', collapse);
  state.map.on('click', (e) => {
    // Only collapse if not clicking a marker
    if (!e.originalEvent.target.closest('.treasure-marker')) {
      collapse();
    }
  });
  
  // Make L available globally for other components
  window.L = L;
  
  console.log('🗺️ Map initialized');
}


/**
 * Add markers for all locations
 */
export function addLocationMarkers() {
  const locations = locationService.getAll();
  const foundIds = userService.getFoundIds();
  
  locations.forEach(location => {
    const isFound = foundIds.has(location.id);
    
    // Create custom marker icon
    const icon = L.divIcon({
      className: 'treasure-marker-wrapper',
      html: `<div class="treasure-marker ${isFound ? 'found' : ''}">💎</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    
    // Create and add marker
    const marker = L.marker([location.latitude, location.longitude], {
      icon: icon,
    }).addTo(state.map);
    
    // Store reference on location object
    location.marker = marker;
    
    // Handle click
    marker.on('click', () => {
      selectLocation(location);
    });
  });
  
  console.log(`📍 Added ${locations.length} markers`);
}


/**
 * Select a location (user tapped marker)
 */
function selectLocation(location) {
  locationService.select(location);
  showLocationDetails(location);
  
  // Pan map to center on location
  state.map.panTo([location.latitude, location.longitude]);
}


/**
 * Update a marker's appearance (e.g., when found)
 */
export function updateMarker(location) {
  if (!location.marker) return;
  
  const isFound = userService.hasFound(location.id);
  const iconEl = location.marker.getElement();
  
  if (iconEl) {
    const markerDiv = iconEl.querySelector('.treasure-marker');
    if (markerDiv) {
      markerDiv.classList.toggle('found', isFound);
    }
  }
}


/**
 * Update all markers (e.g., after loading check-ins)
 */
export function updateAllMarkers() {
  const locations = locationService.getAll();
  locations.forEach(updateMarker);
}


/**
 * Center map on a specific location
 */
export function centerOn(lat, lng, zoom = null) {
  if (zoom) {
    state.map.setView([lat, lng], zoom);
  } else {
    state.map.panTo([lat, lng]);
  }
}


/**
 * Center map on user's current position
 */
export function centerOnUser() {
  const gps = state.gps.currentPosition;
  if (gps) {
    centerOn(gps.coords.latitude, gps.coords.longitude);
  }
}