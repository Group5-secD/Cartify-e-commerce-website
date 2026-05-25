// Product Grid Renderer
async function renderProducts(filterCategory, searchQuery) {
    const category = filterCategory || appState.selectedCategory || 'all';
    const query = (searchQuery || '').toLowerCase();

    const container = document.getElementById('products-grid');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const apiProducts = await response.json();
        window.apiProducts = apiProducts;

        const filtered = apiProducts.filter(p => {
            const pCategoryName = p.categoryname || p.categoryName || '';
            const matchesCategory = category === 'all' || pCategoryName.toLowerCase() === category.toLowerCase();
            const matchesQuery = !query ||
                (p.productName && p.productName.toLowerCase().includes(query)) ||
                (p.productDescription && p.productDescription.toLowerCase().includes(query));
            return matchesCategory && matchesQuery;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="font-size: 1.5rem;">No products found</h3>
                    <p style="color: var(--text-muted);">Try different terms or categories</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(p => {
            const prod = new Product(
                p.productID, 
                p.productName, 
                parseFloat(p.price), 
                p.categoryname || p.categoryName, 
                p.image_url || p.imageUrl, 
                p.productDescription,
                p.stockQuantity
            );
            return prod.displayInfo(wishlist.has(p.productID));
        }).join('');
    } catch (error) {
        console.error("Error loading products:", error);
        container.innerHTML = `<p style="grid-column:1/-1; color:red; text-align:center;">Could not load products. Please try again later.</p>`;
    }
}

// Cart Renderer
function renderCart() {
    const container = document.getElementById('cart-items');
    const empty = document.getElementById('cart-empty');
    const summary = document.getElementById('cart-summary');

    if (cart.items.length === 0) {
        if (container) container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        if (summary) summary.style.display = 'none';
        return;
    }

    if (empty) empty.style.display = 'none';
    if (summary) summary.style.display = 'block';

    if (container) {
        container.innerHTML = cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">ETB ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">ETB ${(item.price * item.quantity).toFixed(2)}</div>
                <button class="cart-item-remove" onclick="cart.remove(${item.id})">×</button>
            </div>
        `).join('');
    }

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = 'ETB ' + cart.total.toFixed(2);
}

// Wishlist Renderer
function renderWishlist() {
    const container = document.getElementById('wishlist-items');
    const empty = document.getElementById('wishlist-empty');
    if (!container) return;

    if (wishlist.items.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';
        container.innerHTML = wishlist.items.map(p => {
        const prod = new Product(p.id, p.name, p.price, p.category, p.image, p.description, p.stockQuantity);
        return prod.displayInfo(true);
    }).join('');
}

// View Management
function showView(viewName) {
    return function () {
        const views = ['home-view', 'products-view', 'cart-view', 'login-view', 'register-view', 'checkout-view', 'wishlist-view', 'about-view', 'contact-view', 'vendor-dashboard-view', 'vendor-products-view', 'vendor-orders-view', 'customer-orders-view'];
        views.forEach(v => {
            const el = document.getElementById(v);
            if (el) el.style.display = 'none';
        });

        const target = document.getElementById(viewName);
        if (target) {
            target.style.display = 'block';
            appState.currentView = viewName;

            // Trigger specific renders
            if (viewName === 'products-view') renderProducts();
            if (viewName === 'cart-view') renderCart();
            if (viewName === 'wishlist-view') renderWishlist();
            if (viewName === 'vendor-dashboard-view') renderVendorDashboard();
            if (viewName === 'vendor-products-view') renderVendorProducts();
            if (viewName === 'vendor-orders-view') renderVendorOrders();
            if (viewName === 'customer-orders-view') renderCustomerOrders();
        }

        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const map = {
                'home-view': 'nav-home',
                'products-view': 'nav-products',
                'cart-view': 'nav-cart',
                'login-view': 'nav-login',
                'register-view': 'nav-register',
                'wishlist-view': 'nav-wishlist',
                'about-view': 'nav-about',
                'contact-view': 'nav-contact',
                'vendor-dashboard-view': 'nav-vendor-dashboard',
                'vendor-products-view': 'nav-vendor-products',
                'vendor-orders-view': 'nav-vendor-orders'
            };
            if (link.id === map[viewName]) link.classList.add('active');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}

// Featured Products (Home Page)
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    fetch(`${API_BASE_URL}/api/products`)
        .then(response => response.json())
        .then(apiProducts => {
            // Take top 4 products for trending
            const featured = apiProducts.slice(0, 4);

            container.innerHTML = featured.map(p => {
                const prod = new Product(
                    p.productID, 
                    p.productName, 
                    parseFloat(p.price), 
                    p.categoryname || p.categoryName, 
                    p.image_url || p.imageUrl, 
                    p.productDescription,
                    p.stockQuantity
                );
                return prod.displayInfo(wishlist.has(p.productID));
            }).join('');
        })
        .catch(error => {
            console.error("Featured products fetch failed:", error);
        });
}

// Vendor Dashboard Render
async function renderVendorDashboard() {
    const welcome = document.getElementById('vendor-welcome-msg');
    if (welcome && appState.currentUser) {
        welcome.textContent = `Manage your store overview for ${appState.currentUser.businessName || 'your business'}.`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/vendor/dashboard`, { credentials: 'include' });
        const data = await response.json();

        if (response.ok) {
            const salesEl = document.getElementById('vendor-total-sales');
            const prodEl = document.getElementById('vendor-product-count');
            const orderEl = document.getElementById('vendor-order-count');

            if (salesEl) salesEl.textContent = 'ETB ' + parseFloat(data.total_sales || 0).toFixed(2);
            if (prodEl) prodEl.textContent = data.product_count || 0;
            if (orderEl) orderEl.textContent = data.order_count || 0;
        }

        // Fetch vendor products to check for out-of-stock items and alert the vendor
        const productsResponse = await fetch(`${API_BASE_URL}/api/vendor/products`, { credentials: 'include' });
        if (productsResponse.ok) {
            const productsList = await productsResponse.json();
            const outOfStock = productsList.filter(p => p.stockQuantity !== undefined && parseInt(p.stockQuantity) <= 0);
            const alertBox = document.getElementById('vendor-low-stock-alert');
            if (alertBox) {
                if (outOfStock.length > 0) {
                    alertBox.style.display = 'block';
                    alertBox.innerHTML = `
                        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1.25rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08); display: flex; align-items: center; gap: 1rem;">
                            <div style="background: #ef4444; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">⚠️</div>
                            <div>
                                <strong style="color: #991b1b; font-size: 1.05rem;">Out of Stock Alert</strong>
                                <p style="margin: 0.25rem 0 0; color: #b91c1c; font-size: 0.95rem;">You have ${outOfStock.length} product(s) that are out of stock. Please restock them to restore customer ordering.</p>
                            </div>
                        </div>
                    `;
                    showNotification(`Warning: You have ${outOfStock.length} product(s) out of stock!`, 'error');
                } else {
                    alertBox.style.display = 'none';
                    alertBox.innerHTML = '';
                }
            }
        }
    } catch (error) {
        console.error("Dashboard stats fetch failed:", error);
    }
}

// Vendor Products List Render
async function renderVendorProducts() {
    const container = document.getElementById('vendor-products-grid');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/vendor/products`, { credentials: 'include' });
        const productsList = await response.json();

        if (!response.ok) throw new Error("Fetch failed");

        if (productsList.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <h3>No products listed yet</h3>
                    <p style="color: var(--text-muted);">Click "+ Add Product" to publish your first item.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productsList.map(p => `
            <div class="product-card" data-id="${p.productID}">
                <div class="product-image-container">
                    <img src="${p.image_url}" alt="${p.productName}" class="product-image" />
                </div>
                <div class="product-details">
                    <span class="product-category">${p.categoryname}</span>
                    <h3 class="product-name">${p.productName}</h3>
                    <div class="product-footer">
                        <span class="product-price">ETB ${parseFloat(p.price).toFixed(2)}</span>
                        <span style="font-size: 0.85rem; color: ${p.stockQuantity <= 5 ? '#ef4444' : '#10b981'}; font-weight: 500;">
                            Stock: ${p.stockQuantity !== undefined ? p.stockQuantity : 'N/A'}
                        </span>
                        <button class="btn" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;" onclick="deleteVendorProduct(${p.productID})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Vendor low stock alert
        const lowStockProducts = productsList.filter(p => p.stockQuantity <= 5);
        let alertBox = document.getElementById('vendor-low-stock-alert');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'vendor-low-stock-alert';
            container.before(alertBox);
        }
        if (lowStockProducts.length > 0) {
            alertBox.innerHTML = `
                <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; margin-bottom: 2rem; border-radius: 4px;">
                    <strong style="color: #991b1b;"><i class="ph-fill ph-warning"></i> Low Stock Alert</strong>
                    <p style="margin: 0.5rem 0 0; color: #b91c1c;">You have ${lowStockProducts.length} product(s) with 5 or fewer items in stock. Please restock soon!</p>
                </div>
            `;
        } else {
            alertBox.innerHTML = '';
        }
    } catch (error) {
        console.error("Vendor products fetch failed:", error);
        container.innerHTML = `<p style="grid-column:1/-1; color:red; text-align:center;">Could not load products.</p>`;
    }
}

// Vendor Orders Render
async function renderVendorOrders() {
    const container = document.getElementById('vendor-orders-table-body');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/vendor/orders`, { credentials: 'include' });
        const ordersList = await response.json();

        if (!response.ok) throw new Error("Fetch failed");

        if (ordersList.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" style="padding:2rem; text-align:center; color: var(--text-muted);">No orders received yet.</td>
                </tr>
            `;
            return;
        }

        container.innerHTML = ordersList.map(o => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 1rem;">#${o.orderID}</td>
                <td style="padding: 1rem;">${o.customer_name}<br><small style="color: var(--text-muted);">${o.customer_email}</small></td>
                <td style="padding: 1rem;"><strong>${o.productName}</strong><br><small style="color: var(--text-muted);">Unit Price: ETB ${parseFloat(o.unit_price).toFixed(2)}</small></td>
                <td style="padding: 1rem;">${o.quantity}</td>
                <td style="padding: 1rem; font-weight: 600;">ETB ${parseFloat(o.item_total).toFixed(2)}</td>
                <td style="padding: 1rem;">${o.streetAddress}, ${o.city}<br><small style="color: var(--text-muted);">Zip: ${o.zipCode}</small></td>
                <td style="padding: 1rem;">${new Date(o.orderDate).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Vendor orders fetch failed:", error);
        container.innerHTML = `<tr><td colspan="7" style="padding:2rem; text-align:center; color:red;">Could not load orders.</td></tr>`;
    }
}

async function renderCustomerOrders() {
    const list = document.getElementById('customer-orders-list');
    if (!list) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, { credentials: 'include' });
        if (!response.ok) throw new Error("Failed to load orders");
        const data = await response.json();
        const orders = data.orders || [];

        if (orders.length === 0) {
            list.innerHTML = `<div style="text-align: center; padding: 2rem;">No orders found.</div>`;
            return;
        }

        list.innerHTML = orders.map(order => `
            <div class="card" style="margin-bottom: 1rem; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem;">Order #${order.orderID}</h3>
                        <p class="text-muted" style="margin: 0.5rem 0 0;">Placed on: ${new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="badge" style="background: var(--bg-secondary); color: var(--primary);">
                            ${order.estimatedDelivery ? 'Expected: ' + order.estimatedDelivery : 'Processing'}
                        </span>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                    ${(order.items || []).map(item => `
                        <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                            <img src="${item.image_url || 'imgs/placeholder.png'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: var(--radius-sm);">
                            <div>
                                <p style="margin: 0; font-weight: 500;">${item.productName}</p>
                                <p style="margin: 0; color: var(--text-muted); font-size: 0.875rem;">Qty: ${item.quantity} × ETB ${parseFloat(item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem;">
                    <strong>Total: ETB ${parseFloat(order.totalAmount || 0).toFixed(2)}</strong>
                    ${order.isReturnable ? `
                        <button class="btn btn-outline" style="font-size: 0.875rem; padding: 0.5rem 1rem;">Request Return (${order.returnDaysLeft} days left)</button>
                    ` : `
                        <span style="color: var(--danger); font-size: 0.875rem;">Return window closed</span>
                    `}
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        list.innerHTML = `<div style="text-align: center; color: var(--danger);">Failed to load orders.</div>`;
    }
}
