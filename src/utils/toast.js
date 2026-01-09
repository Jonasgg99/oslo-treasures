/**
 * TOAST NOTIFICATIONS
 * 
 * Simple popup messages for feedback.
 */

import { CONFIG } from '../config.js';


/**
 * Show a toast notification
 * 
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', or '' (default)
 */
export function showToast(message, type = '') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Remove after animation
  setTimeout(() => {
    toast.remove();
  }, CONFIG.TOAST_DURATION);
}


/**
 * Show a success toast
 */
export function showSuccess(message) {
  showToast(message, 'success');
}


/**
 * Show an error toast
 */
export function showError(message) {
  showToast(message, 'error');
}
