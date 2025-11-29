// Clear localStorage and reinitialize with fresh data
// Run this in browser console to reset the app data

// Clear existing data
localStorage.removeItem('Event');
localStorage.removeItem('Moment');
localStorage.removeItem('Friendship');

console.log('✅ localStorage cleared! Refresh the page to load fresh sample data with organizer_id.');
