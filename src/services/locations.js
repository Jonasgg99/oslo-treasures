/**
 * LOCATIONS SERVICE
 * 
 * Manages treasure locations: loading from database, demo data.
 */

import { state, notifyListeners } from './state.js';
import * as db from './supabase.js';
import { demoLocations } from '../data/locations.js';


export const locationService = {
  /**
   * Load all locations from database or demo data
   */
  async loadLocations() {
    if (db.isConnected()) {
      // Load from Supabase
      const { data, error } = await db.getLocations();
      
      if (error) {
        console.error('Failed to load locations:', error);
        // Fall back to demo data
        state.locations = demoLocations;
      } else {
        state.locations = data;
      }
    } else {
      // Use demo data
      state.locations = demoLocations;
    }
    
    console.log(`📍 Loaded ${state.locations.length} locations`);
    notifyListeners();
  },
  
  
  /**
   * Get all locations
   */
  getAll() {
    return state.locations;
  },
  
  
  /**
   * Get a location by ID
   */
  getById(id) {
    return state.locations.find(loc => loc.id === id);
  },
  
  
  /**
   * Get locations by category
   */
  getByCategory(category) {
    return state.locations.filter(loc => loc.category === category);
  },
  
  
  /**
   * Get all unique categories
   */
  getCategories() {
    const categories = new Set(state.locations.map(loc => loc.category));
    return [...categories].filter(Boolean);
  },
  
  
  /**
   * Get locations filtered by found status
   */
  getFound(foundIds) {
    return state.locations.filter(loc => foundIds.has(loc.id));
  },
  
  
  /**
   * Get unfound locations
   */
  getUnfound(foundIds) {
    return state.locations.filter(loc => !foundIds.has(loc.id));
  },
  
  
  /**
   * Select a location (user tapped a marker)
   */
  select(location) {
    state.selectedLocation = location;
    notifyListeners();
  },
  
  
  /**
   * Get currently selected location
   */
  getSelected() {
    return state.selectedLocation;
  },
  
  
  /**
   * Clear selection
   */
  clearSelection() {
    state.selectedLocation = null;
    notifyListeners();
  },
};
