const API_BASE = 'http://localhost:8000/api/admin';

// DOM Elements
const loginOverlay = document.getElementById('login-overlay');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('admin-login-form');
const loginError = document.getElementById('login-error');
const adminName = document.getElementById('admin-name');
const logoutBtn = document.getElementById('logout-btn');

// Fetch Helpers
async function fetchAPI(endpoint, options = {}) {
    options.credentials = 'include';
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    return res.json();
}

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Check session
    const session = await fetchAPI('/auth/session');
    if (session.logged_in && session.role === 'admin') {
        showApp(session.username);
    }

    // View Routing setup
    setupNavigation();
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginError.textContent = '';
    const res = await fetchAPI('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (res.status === 'success') {
        showApp(res.username);
    } else {
        loginError.textContent = res.message;
    }
});

// Logout
logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetchAPI('/auth/logout');
    location.reload();
});

function showApp(username) {
    loginOverlay.classList.add('hidden');
    appContainer.classList.remove('hidden');
    adminName.textContent = username;
    loadDashboardStats();
}

// Navigation Logic
function setupNavigation() {
    const navItems = document.querySelectorAll('[data-view]');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            
            // Update active states
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll(`[data-view="${viewName}"]`).forEach(n => n.classList.add('active'));

            // Show view
            views.forEach(v => v.classList.add('hidden'));
            document.getElementById(`view-${viewName}`).classList.remove('hidden');

            // Load data based on view
            if (viewName === 'dashboard') loadDashboardStats();
            if (viewName === 'users') loadUsers();
            if (viewName === 'products') loadProducts();
            if (viewName === 'categories') loadCategories();
            if (viewName === 'orders') loadOrders();
        });
    });
}

// View: Dashboard
async function loadDashboardStats() {
    const data = await fetchAPI('/dashboard/stats');
    if (data.status === 'success') {
        const grid = document.querySelector('.stats-grid');
        grid.innerHTML = `
            <div class="stat-card black">
                <span class="stat-title">Total Revenue</span>
                <span class="stat-value">${parseFloat(data.stats.revenue).toFixed(2)} ETB</span>
                <span class="text-muted"><i class="ph-fill ph-trend-up"></i> Lifetime</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Total Orders</span>
                <span class="stat-value">${data.stats.orders}</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Products</span>
                <span class="stat-value">${data.stats.products}</span>
            </div>
            <div class="stat-card">
                <span class="stat-title">Total Users</span>
                <span class="stat-value">${data.stats.users}</span>
                <span class="text-muted">Incl. ${data.stats.vendors} Vendors</span>
            </div>
        `;
    }
    
    // Load products into the dashboard table
    loadProducts();
}

// View: Users
async function loadUsers() {
    const data = await fetchAPI('/users');
    const tbody = document.getElementById('users-tbody');
    if (data.status === 'success') {
        tbody.innerHTML = data.users.map(u => `
            <tr>
                <td>#${u.accID}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.role}">${u.role}</span></td>
                <td>N/A</td>
                <td>
                    <button class="btn-danger" onclick="deleteUser(${u.accID})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

async function deleteUser(accID) {
    if (confirm('Are you sure you want to delete this user?')) {
        const res = await fetchAPI('/users/suspend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accID })
        });
        if (res.status === 'success') loadUsers();
        else alert(res.message);
    }
}

// View: Products (Now on Dashboard)
async function loadProducts() {
    const data = await fetchAPI('/products');
    const tbody = document.getElementById('products-tbody');
    if (data.status === 'success') {
        tbody.innerHTML = data.products.map(p => {
            let imgUrl = 'https://placehold.co/100x100?text=No+Img';
            if (p.image_url) {
                imgUrl = p.image_url.startsWith('http') ? p.image_url : p.image_url;
            }
            const vendor = p.vendor_name || 'N/A';
            return `
            <tr>
                <td><img src="${imgUrl}" alt="${p.productName}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;"></td>
                <td>#${p.productID}</td>
                <td><strong>${p.productName}</strong></td>
                <td>${vendor}</td>
                <td style="color: ${p.stockQuantity <= 5 ? '#ef4444' : '#10b981'}; font-weight: 500;">
                    ${p.stockQuantity !== undefined ? p.stockQuantity : 'N/A'}
                </td>
                <td>${parseFloat(p.price).toFixed(2)} ETB</td>
                <td>
                    <button class="btn-danger" onclick="deleteProduct(${p.productID})">Delete</button>
                </td>
            </tr>
            `;
        }).join('');

        // Low stock alert box
        const lowStockProducts = data.products.filter(p => p.stockQuantity !== undefined && parseInt(p.stockQuantity) <= 5);
        const outOfStockProducts = data.products.filter(p => p.stockQuantity !== undefined && parseInt(p.stockQuantity) <= 0);
        let alertBox = document.getElementById('low-stock-alert');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'low-stock-alert';
            document.querySelector('.stats-grid').after(alertBox);
        }
        if (lowStockProducts.length > 0) {
            alertBox.innerHTML = `
                <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; margin-bottom: 2rem; border-radius: 4px;">
                    <strong style="color: #991b1b;"><i class="ph-fill ph-warning"></i> Low Stock Alert</strong>
                    <p style="margin: 0.5rem 0 0; color: #b91c1c;">You have ${lowStockProducts.length} product(s) with 5 or fewer items in stock.</p>
                </div>
            `;
            if (outOfStockProducts.length > 0) {
                showAdminNotification(`Warning: There are ${outOfStockProducts.length} product(s) completely out of stock!`, 'danger');
            }
        } else {
            alertBox.innerHTML = '';
        }
    }
}

async function deleteProduct(productID) {
    if (confirm('Are you sure you want to delete this product?')) {
        const res = await fetchAPI('/products/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productID })
        });
        if (res.status === 'success') loadProducts();
        else alert(res.message);
    }
}

// View: Categories
async function loadCategories() {
    const data = await fetchAPI('/categories');
    const tbody = document.getElementById('categories-tbody');
    if (data.status === 'success') {
        tbody.innerHTML = data.categories.map(c => `
            <tr>
                <td>#${c.categoryID}</td>
                <td><strong>${c.categoryname}</strong></td>
                <td>
                    <button class="btn-danger" onclick="deleteCategory(${c.categoryID})">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

document.getElementById('btn-add-category').addEventListener('click', () => {
    document.getElementById('add-category-form').classList.remove('hidden');
});
document.getElementById('cancel-category').addEventListener('click', () => {
    document.getElementById('add-category-form').classList.add('hidden');
    document.getElementById('new-category-name').value = '';
});
document.getElementById('submit-category').addEventListener('click', async () => {
    const name = document.getElementById('new-category-name').value;
    if (!name) return alert('Category name is required');

    const res = await fetchAPI('/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryname: name })
    });
    
    if (res.status === 'success') {
        document.getElementById('add-category-form').classList.add('hidden');
        document.getElementById('new-category-name').value = '';
        loadCategories();
    } else {
        alert(res.message);
    }
});

async function deleteCategory(categoryID) {
    if (confirm('Delete this category?')) {
        const res = await fetchAPI('/categories/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryID })
        });
        if (res.status === 'success') loadCategories();
        else alert(res.message);
    }
}

// View: Orders
async function loadOrders() {
    const data = await fetchAPI('/orders');
    const tbody = document.getElementById('orders-tbody');
    if (data.status === 'success') {
        tbody.innerHTML = data.orders.map(o => `
            <tr>
                <td>#${o.orderID}</td>
                <td><strong>${o.accName}</strong><br><span class="text-muted">${o.email}</span></td>
                <td>${new Date(o.orderDate).toLocaleString()}</td>
                <td>${parseFloat(o.totalAmount).toFixed(2)} ETB</td>
            </tr>
        `).join('');
    }
}

// Toast notification helper for Admin Dashboard
function showAdminNotification(message, type = 'warning') {
    // Check if duplicate toast already exists to prevent spamming
    const existing = Array.from(document.querySelectorAll('.admin-toast')).find(t => t.textContent === message);
    if (existing) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'danger' || type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        font-weight: 600;
        font-family: inherit;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(-20px);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    // remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}
