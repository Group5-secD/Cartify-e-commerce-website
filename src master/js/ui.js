// Product Grid Renderer
function renderProducts(filterCategory, searchQuery) {
    const category = filterCategory || appState.selectedCategory || 'all';
    const query = (searchQuery || '').toLowerCase();

    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = products.filter(p => {
        const matchesCategory = category === 'all' || p.category === category;
        const matchesQuery = !query ||
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query);
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
        const prod = new Product(p.id, p.name, p.price, p.category, p.image, p.description);
        return prod.displayInfo(wishlist.has(p.id));
    }).join('');
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
        const prod = new Product(p.id, p.name, p.price, p.category, p.image, p.description);
        return prod.displayInfo(true);
    }).join('');
}

// View Management
function showView(viewName) {
    return function () {
        const views = ['home-view', 'products-view', 'cart-view', 'login-view', 'register-view', 'checkout-view', 'wishlist-view', 'about-view', 'contact-view'];
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
                'contact-view': 'nav-contact'
            };
            if (link.id === map[viewName]) link.classList.add('active');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
}
