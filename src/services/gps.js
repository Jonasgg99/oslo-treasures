/**
 * GPS SERVICE
 * 
 * Handles all GPS/geolocation functionality.
 * Tracks user position and calculates distances.
 */

import { state, notifyListeners } from './state.js';
import { CONFIG } from '../config.js';
import { showToast } from '../utils/toast.js';
import { updateCheckinButton } from '../components/BottomSheet.js';


export const gpsService = {
  /**
   * Start watching the user's position
   */
  startTracking() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      showToast('Location not supported on this device', 'error');
      return;
    }
    
    // Show loading indicator
    const statusEl = document.getElementById('gpsStatus');
    if (statusEl) {
      statusEl.classList.add('active');
    }
    
    // Start watching position
    state.gps.watchId = navigator.geolocation.watchPosition(
      // Success callback
      (position) => {
        this.handlePositionUpdate(position);
      },
      // Error callback
      (error) => {
        this.handlePositionError(error);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: CONFIG.GPS_TIMEOUT,
        maximumAge: CONFIG.GPS_MAX_AGE,
      }
    );
    
    console.log('📍 GPS tracking started');
  },
  
  
  /**
   * Stop watching position
   */
  stopTracking() {
    if (state.gps.watchId !== null) {
      navigator.geolocation.clearWatch(state.gps.watchId);
      state.gps.watchId = null;
      console.log('📍 GPS tracking stopped');
    }
  },
  
  
  /**
   * Handle a new position update
   */
  handlePositionUpdate(position) {
    // Hide loading indicator
    const statusEl = document.getElementById('gpsStatus');
    if (statusEl) {
      statusEl.classList.remove('active');
    }
    
    // Store position
    state.gps.currentPosition = position;
    
    // Update user marker on map
    this.updateUserMarker(position);
    
    // Update check-in button (distance might have changed)
    updateCheckinButton();
    
    notifyListeners();
  },
  
  
  /**
   * Handle GPS errors
   */
  handlePositionError(error) {
    console.error('GPS error:', error.code, error.message);
    
    // On timeout, just keep trying - don't show error
    if (error.code === 3) {
      console.log('GPS timeout, retrying...');
      return; // watchPosition will keep trying automatically
    }
    
    // Hide loading indicator
    const statusEl = document.getElementById('gpsStatus');
    if (statusEl) {
      statusEl.classList.remove('active');
    }
    
    const messages = {
      1: 'Location access denied. Enable it in settings.',
      2: 'Unable to get location. Try going outside.',
    };
    
    showToast(messages[error.code] || 'Location error', 'error');
  },
  
  
  /**
   * Update the user's marker on the map
   */
  updateUserMarker(position) {
    if (!state.map) return;
    
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    // Import L from leaflet (it's on window after map init)
    const L = window.L;
    
    if (state.gps.userMarker) {
      // Update existing marker
      state.gps.userMarker.setLatLng([lat, lng]);
      state.gps.accuracyCircle.setLatLng([lat, lng]);
      state.gps.accuracyCircle.setRadius(accuracy);
      
    } else {
      // Create new marker
      const userIcon = L.divIcon({
        className: 'user-marker-wrapper',
        html: '<div class="user-marker"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      
      state.gps.userMarker = L.marker([lat, lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(state.map);
      
      // Accuracy circle
      state.gps.accuracyCircle = L.circle([lat, lng], {
        radius: accuracy,
        className: 'leaflet-user-accuracy',
        interactive: false,
      }).addTo(state.map);
    }
  },
  
  
  /**
   * Get current position (or null if not available)
   */
  getCurrentPosition() {
    return state.gps.currentPosition;
  },
  
  
  /**
   * Calculate distance from current position to a point
   * Returns distance in meters, or null if GPS not available
   */
  getDistanceTo(lat, lng) {
    if (!state.gps.currentPosition) {
      return null;
    }
    
    return getDistanceMeters(
      state.gps.currentPosition.coords.latitude,
      state.gps.currentPosition.coords.longitude,
      lat,
      lng
    );
  },
  
  
  /**
   * Check if user is within check-in range of a location
   */
  isInRange(location) {
    const distance = this.getDistanceTo(location.latitude, location.longitude);
    if (distance === null) return false;
    return distance <= CONFIG.CHECKIN_RADIUS_METERS;
  },
};


/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}


/**
 * Format distance for display
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}