/**
 * APPLICATION CONFIGURATION
 * 
 * All configurable values in one place.
 * In a production app, some of these would come from environment variables.
 */

export const CONFIG = {
  // Supabase credentials
  // Replace these with your own from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
  SUPABASE_URL: 'YOUR_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  
  // GPS settings
  CHECKIN_RADIUS_METERS: 50,  // How close user must be to check in
  GPS_TIMEOUT: 30000,          // Max time to wait for GPS fix (ms)
  GPS_MAX_AGE: 10000,          // Accept positions up to 10s old
  
  // Map settings
  DEFAULT_CENTER: [59.9139, 10.7522],  // Oslo city center
  DEFAULT_ZOOM: 14,
  MAX_ZOOM: 19,
  
  // UI settings
  TOAST_DURATION: 3000,  // How long toasts stay visible (ms)
  
  // Feature flags
  DEMO_MODE: false,  // Set to true to use local data without Supabase
};


/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  return CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
         CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}