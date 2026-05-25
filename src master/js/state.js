const API_BASE_URL = `http://${window.location.hostname}:8000`;

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
    async add(productId) {
        let product = null;
        if (window.apiProducts) {
            const p = window.apiProducts.find(item => item.productID == productId);
            if (p) {
                product = {
                    id: p.productID,
                    name: p.productName,
                    price: parseFloat(p.price),
                    category: p.categoryname || p.categoryName,
                    image: p.image_url || p.imageUrl,
                    description: p.productDescription,
                    stockQuantity: p.stockQuantity
                };
            }
        }
        if (!product && typeof products !== 'undefined') {
            product = products.find(p => p.id == productId);
        }
        if (!product) return;

        if (!appState.currentUser) {
            // Guest mode: save to local cart
            const existingItem = this.items.find(item => item.id === productId);
            const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
            
            if (product.stockQuantity !== undefined && newQuantity > product.stockQuantity) {
                if (typeof showNotification === 'function') showNotification('Cannot add more than available stock', 'error');
                return;
            }

            if (existingItem) existingItem.quantity = newQuantity;
            else this.items.push({ ...product, quantity: 1 });
            
            this.save();
            this.updateCartBadge();
            if (typeof showNotification === 'function') showNotification(product.name + ' added to cart!');
            return;
        }

        // Sync with backend FIRST to check authorization
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/add.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
                credentials: "include"
            });

            if (response.status === 401) {
                showNotification("Please log in to add items to your cart", "error");
                showView("login-view")();
                return;
            }

            if (!response.ok) throw new Error("Backend sync failed");

            // Only update local state if backend succeeds
            const existingItem = this.items.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }
            this.save();
            this.updateCartBadge();

            if (typeof showNotification === 'function') {
                showNotification(product.name + ' added to cart!');
            }
        } catch (error) {
            console.error("Cart sync error:", error);
            showNotification("Could not connect to server", "error");
        }
    },
    async syncToBackend() {
        if (!this.items.length) {
            return this.fetchFromBackend();
        }
        try {
            const payload = this.items.map(i => ({ product_id: i.id, quantity: i.quantity }));
            const response = await fetch(`${API_BASE_URL}/api/cart/sync.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: payload }),
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                this.loadFromBackendData(data.cart);
            }
        } catch (error) {
            console.error("Cart sync error:", error);
        }
    },
    async fetchFromBackend() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/get.php`, {
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                this.loadFromBackendData(data.cart);
            }
        } catch (error) {
            console.error("Cart fetch error:", error);
        }
    },
    loadFromBackendData(dbCart) {
        if (!dbCart) return;
        this.items = dbCart.map(p => ({
            id: p.productID,
            name: p.productName,
            price: parseFloat(p.price),
            category: p.categoryname,
            image: p.image_url,
            quantity: parseInt(p.quantity)
        }));
        this.save();
        this.updateCartBadge();
        if (typeof renderCart === 'function') renderCart();
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
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.textContent = this.itemCount;
            badge.style.display = this.itemCount > 0 ? 'flex' : 'none';
        });
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
            let product = null;
            if (window.apiProducts) {
                const p = window.apiProducts.find(item => item.productID == productId);
                if (p) {
                    product = {
                        id: p.productID,
                        name: p.productName,
                        price: parseFloat(p.price),
                        category: p.categoryname || p.categoryName,
                        image: p.image_url || p.imageUrl,
                        description: p.productDescription
                    };
                }
            }
            if (!product && typeof products !== 'undefined') {
                product = products.find(p => p.id == productId);
            }
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
    },
    clear() {
        this.items = [];
        this.save();
        if (typeof renderProducts === 'function') renderProducts();
        if (typeof renderWishlist === 'function') renderWishlist();
    }
};
