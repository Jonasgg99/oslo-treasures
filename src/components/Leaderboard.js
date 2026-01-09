/**
 * LEADERBOARD COMPONENT
 * 
 * Displays top users by points.
 */

import { state } from '../services/state.js';
import { userService } from '../services/user.js';
import * as db from '../services/supabase.js';
import { escapeHtml } from '../utils/helpers.js';


/**
 * Render the leaderboard
 */
export async function renderLeaderboard() {
  const listEl = document.getElementById('leaderboardList');
  listEl.innerHTML = '<p class="loading">Loading...</p>';
  
  let leaderboardData = [];
  
  if (db.isConnected()) {
    const { data, error } = await db.getLeaderboard(20);
    
    if (error) {
      console.error('Failed to load leaderboard:', error);
      listEl.innerHTML = '<p class="empty-state">Failed to load leaderboard</p>';
      return;
    }
    
    leaderboardData = data;
  } else {
    // Demo mode - just show current user
    const user = userService.getUser();
    leaderboardData = [{
      id: user.id,
      username: user.username,
      total_points: user.points,
    }];
  }
  
  if (leaderboardData.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No explorers yet. Be the first!</p>';
    return;
  }
  
  const currentUserId = userService.getUser().id;
  
  listEl.innerHTML = leaderboardData.map((user, index) => `
    <div class="leaderboard-item ${user.id === currentUserId ? 'current-user' : ''}">
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${escapeHtml(user.username)}</span>
      <span class="leaderboard-points">${user.total_points} pts</span>
    </div>
  `).join('');
}
