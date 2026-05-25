// notifications.js
let unreadNotifications = [];

function toggleNotifications() {
  const menu = document.getElementById('notification-menu');
  if (menu.style.display === 'none' || menu.style.display === '') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const container = document.getElementById('notification-dropdown-container');
  const menu = document.getElementById('notification-menu');
  if (container && menu && !container.contains(e.target)) {
    menu.style.display = 'none';
  }
});

async function fetchNotifications() {
  // Only fetch if logged in
  if (!appState || !appState.currentUser) return;
  
  // Determine if admin or vendor based on role
  let rolePath = 'vendor';
  if (appState.currentUser.role === 'admin') {
      rolePath = 'admin';
  } else if (appState.currentUser.role !== 'vendor') {
      // Customers don't have notifications in this implementation
      return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/${rolePath}/notifications`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        unreadNotifications = result.notifications || [];
        renderNotifications();
      }
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

function renderNotifications() {
  const badge = document.getElementById('notification-badge');
  const list = document.getElementById('notification-list');
  const container = document.getElementById('notification-dropdown-container');

  if (!badge || !list || !container) return;

  if (unreadNotifications.length > 0) {
    badge.style.display = 'inline-block';
    badge.innerText = unreadNotifications.length;
    
    list.innerHTML = '';
    unreadNotifications.forEach(notif => {
      const item = document.createElement('div');
      item.style.padding = '1rem';
      item.style.borderBottom = '1px solid #e5e7eb';
      item.style.cursor = 'pointer';
      item.style.transition = 'background 0.2s';
      item.innerHTML = `
        <div style="font-size: 0.85rem; color: #111827;">${notif.message}</div>
        <div style="font-size: 0.7rem; color: #6b7280; margin-top: 0.5rem;">${new Date(notif.createdAt).toLocaleString()}</div>
      `;
      item.onmouseover = () => item.style.backgroundColor = '#f9fafb';
      item.onmouseout = () => item.style.backgroundColor = 'transparent';
      item.onclick = () => markNotificationAsRead(notif.notificationID);
      list.appendChild(item);
    });
  } else {
    badge.style.display = 'none';
    list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #6b7280; font-size: 0.875rem;">No new notifications</div>';
  }
}

async function markNotificationAsRead(id) {
  if (!appState || !appState.currentUser) return;
  
  let rolePath = appState.currentUser.role === 'admin' ? 'admin' : 'vendor';

  try {
    const response = await fetch(`${API_BASE_URL}/api/${rolePath}/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ notificationID: id })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.status === 'success') {
        // Remove from local list
        unreadNotifications = unreadNotifications.filter(n => n.notificationID !== id);
        renderNotifications();
      }
    }
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
}

// Fetch notifications periodically
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(fetchNotifications, 1000); // initial fetch
  setInterval(fetchNotifications, 30000); // poll every 30s
});
