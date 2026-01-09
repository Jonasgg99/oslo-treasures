/**
 * USER SERVICE
 * 
 * Manages user data: loading, saving, points, check-ins.
 * Handles both Supabase (production) and localStorage (demo mode).
 */

import { state, notifyListeners } from './state.js';
import * as db from './supabase.js';
import { generateUUID } from '../utils/helpers.js';

// LocalStorage keys
const STORAGE_KEY_USER = 'oslo_treasures_user';
const STORAGE_KEY_CHECKINS = 'oslo_treasures_checkins';


export const userService = {
  /**
   * Initialize user - load from storage or create new
   */
  async init() {
    // Try to load existing user from localStorage
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      state.user = userData;
      console.log('👤 Loaded existing user:', state.user.username);
    } else {
      // Create a new user
      state.user = {
        id: generateUUID(),
        username: 'Explorer',
        points: 0,
      };
      this.save();
      console.log('👤 Created new user');
    }
    
    // Sync to database if connected
    if (db.isConnected()) {
      await db.upsertUser(state.user);
    }
    
    notifyListeners();
  },
  
  
  /**
   * Save user to localStorage
   */
  save() {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.user));
  },
  
  
  /**
   * Update username
   */
  async setUsername(username) {
    if (!username || username.length < 2) {
      throw new Error('Username must be at least 2 characters');
    }
    
    state.user.username = username;
    this.save();
    
    if (db.isConnected()) {
      await db.upsertUser(state.user);
    }
    
    this.updateUI();
    notifyListeners();
  },
  
  
  /**
   * Add points to user
   */
  async addPoints(points) {
    state.user.points += points;
    this.save();
    
    if (db.isConnected()) {
      await db.updateUserPoints(state.user.id, state.user.points);
    }
    
    this.updateUI();
    notifyListeners();
  },
  
  
  /**
   * Load user's check-ins
   */
  async loadCheckins() {
    if (db.isConnected()) {
      // Load from database
      const { data, error } = await db.getUserCheckins(state.user.id);
      
      if (error) {
        console.error('Failed to load check-ins:', error);
        return;
      }
      
      state.foundLocationIds = new Set(data.map(row => row.location_id));
      
      // Recalculate points from found locations
      this.recalculatePoints();
      
    } else {
      // Load from localStorage (demo mode)
      const saved = localStorage.getItem(STORAGE_KEY_CHECKINS);
      if (saved) {
        state.foundLocationIds = new Set(JSON.parse(saved));
        this.recalculatePoints();
      }
    }
    
    console.log(`📍 Loaded ${state.foundLocationIds.size} check-ins`);
    notifyListeners();
  },
  
  
  /**
   * Record a check-in at a location
   */
  async checkin(location, coords) {
    // Already checked in?
    if (state.foundLocationIds.has(location.id)) {
      throw new Error('Already found this location');
    }
    
    // Save to database
    if (db.isConnected()) {
      const { error } = await db.createCheckin(
        state.user.id,
        location.id,
        coords
      );
      
      if (error) {
        // Duplicate check-in (race condition)
        if (error.code === '23505') {
          throw new Error('Already found this location');
        }
        throw error;
      }
    }
    
    // Update local state
    state.foundLocationIds.add(location.id);
    await this.addPoints(location.points);
    
    // Save to localStorage (for demo mode persistence)
    localStorage.setItem(
      STORAGE_KEY_CHECKINS,
      JSON.stringify([...state.foundLocationIds])
    );
    
    notifyListeners();
    return location.points;
  },
  
  
  /**
   * Check if a location has been found
   */
  hasFound(locationId) {
    return state.foundLocationIds.has(locationId);
  },
  
  
  /**
   * Recalculate total points from found locations
   */
  recalculatePoints() {
    let total = 0;
    state.locations.forEach(loc => {
      if (state.foundLocationIds.has(loc.id)) {
        total += loc.points;
      }
    });
    state.user.points = total;
    this.save();
  },
  
  
  /**
   * Update the UI with current user state
   */
  updateUI() {
    const usernameEl = document.getElementById('usernameDisplay');
    const pointsEl = document.getElementById('pointsDisplay');
    
    if (usernameEl) {
      usernameEl.textContent = state.user.username;
    }
    if (pointsEl) {
      pointsEl.textContent = `${state.user.points} pts`;
    }
  },
  
  
  /**
   * Get current user
   */
  getUser() {
    return state.user;
  },
  
  
  /**
   * Get found location IDs
   */
  getFoundIds() {
    return state.foundLocationIds;
  },
};
