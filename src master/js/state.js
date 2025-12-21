const appState = {
    currentUser: null,
    currentView: 'home-view',
    selectedCategory: 'all',
    orders: []
};

const cart = {
    items: [],
    get total() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },
    add(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
        this.updateCartBadge();
        // UI notification handled in app.js or ui.js
        if (typeof showNotification === 'function') {
            showNotification(product.name + ' added to cart!');
        }
    },
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartBadge();
        if (typeof renderCart === 'function') renderCart();
    },
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = newQuantity;
                this.save();
                this.updateCartBadge();
                if (typeof renderCart === 'function') renderCart();
            }
        }
    },
    clear() {
        this.items = [];
        this.save();
        this.updateCartBadge();
        if (typeof renderCart === 'function') renderCart();
    },
    save() {
        localStorage.setItem('cart_items', JSON.stringify(this.items));
    },
    load() {
        const saved = localStorage.getItem('cart_items');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    },
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.textContent = this.itemCount;
            badge.style.display = this.itemCount > 0 ? 'flex' : 'none';
        }
    }
};

const wishlist = {
    items: [],
    has(productId) {
        return this.items.some(item => item.id === productId);
    },
    toggle(productId, event) {
        if (event) event.stopPropagation();
        if (this.has(productId)) {
            this.items = this.items.filter(item => item.id !== productId);
        } else {
            const product = products.find(p => p.id === productId);
            if (product) this.items.push(product);
        }
        this.save();
        if (typeof renderProducts === 'function') renderProducts();
        if (appState.currentView === 'wishlist-view' && typeof renderWishlist === 'function') renderWishlist();
    },
    save() {
        localStorage.setItem('wishlist_items', JSON.stringify(this.items));
    },
    load() {
        const saved = localStorage.getItem('wishlist_items');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    }
};
