/**
 * SUPABASE SERVICE
 * 
 * Handles all communication with the Supabase backend.
 * Provides a clean API for the rest of the app to use.
 */

import { createClient } from '@supabase/supabase-js';
import { CONFIG, isSupabaseConfigured } from '../config.js';
import { state } from './state.js';


/**
 * Initialize the Supabase client
 */
export function initSupabase() {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured. Running in demo mode.');
    console.warn('   Edit src/config.js to add your credentials.');
    return null;
  }
  
  state.supabase = createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
  );
  
  console.log('📡 Supabase client initialized');
  return state.supabase;
}


/**
 * Get the Supabase client (or null if not configured)
 */
export function getSupabase() {
  return state.supabase;
}


/**
 * Check if we're connected to Supabase
 */
export function isConnected() {
  return state.supabase !== null;
}


// ============================================
// USER OPERATIONS
// ============================================

/**
 * Upsert (create or update) a user record
 */
export async function upsertUser(user) {
  if (!isConnected()) return { data: null, error: null };
  
  const { data, error } = await state.supabase
    .from('users')
    .upsert({
      id: user.id,
      username: user.username,
      total_points: user.points,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Failed to upsert user:', error);
  }
  
  return { data, error };
}


/**
 * Update user's total points
 */
export async function updateUserPoints(userId, points) {
  if (!isConnected()) return { data: null, error: null };
  
  const { data, error } = await state.supabase
    .from('users')
    .update({ total_points: points })
    .eq('id', userId);
  
  return { data, error };
}


/**
 * Get leaderboard (top users by points)
 */
export async function getLeaderboard(limit = 20) {
  if (!isConnected()) return { data: [], error: null };
  
  const { data, error } = await state.supabase
    .from('users')
    .select('id, username, total_points')
    .order('total_points', { ascending: false })
    .limit(limit);
  
  return { data: data || [], error };
}


// ============================================
// LOCATION OPERATIONS
// ============================================

/**
 * Get all active locations
 */
export async function getLocations() {
  if (!isConnected()) return { data: [], error: null };
  
  const { data, error } = await state.supabase
    .from('locations')
    .select('*')
    .eq('active', true)
    .order('name');
  
  return { data: data || [], error };
}


// ============================================
// CHECKIN OPERATIONS
// ============================================

/**
 * Get all check-ins for a user
 */
export async function getUserCheckins(userId) {
  if (!isConnected()) return { data: [], error: null };
  
  const { data, error } = await state.supabase
    .from('checkins')
    .select('location_id, checked_in_at')
    .eq('user_id', userId);
  
  return { data: data || [], error };
}


/**
 * Create a new check-in
 */
export async function createCheckin(userId, locationId, coords) {
  if (!isConnected()) return { data: null, error: null };
  
  const { data, error } = await state.supabase
    .from('checkins')
    .insert({
      user_id: userId,
      location_id: locationId,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    })
    .select()
    .single();
  
  return { data, error };
}
