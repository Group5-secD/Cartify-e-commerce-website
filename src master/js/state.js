const appState = {
    currentUser: null,
    currentView: 'home-view',
    selectedCategory: 'all',
    orders: [],
    products: []
};

// Simple Observer Pattern for decoupling UI
class Observable {
    constructor() {
        this.listeners = [];
    }
    subscribe(fn) {
        this.listeners.push(fn);
    }
    notify() {
        this.listeners.forEach(fn => fn(this));
    }
}

class Cart extends Observable {
    constructor() {
        super();
        this.items = [];
    }
    get total() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    get itemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    add(productId) {
        const product = appState.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.save();
        this.notify();
    }
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.notify();
    }
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.remove(productId);
            } else {
                item.quantity = newQuantity;
                this.save();
                this.notify();
            }
        }
    }
    clear() {
        this.items = [];
        this.save();
        this.notify();
    }
    save() {
        localStorage.setItem('cart_items', JSON.stringify(this.items));
    }
    load() {
        const saved = localStorage.getItem('cart_items');
        if (saved) {
            this.items = JSON.parse(saved);
        }
        this.notify();
    }
}

class Wishlist extends Observable {
    constructor() {
        super();
        this.items = [];
    }
    has(productId) {
        return this.items.some(item => item.id === productId);
    }
    toggle(productId) {
        if (this.has(productId)) {
            this.items = this.items.filter(item => item.id !== productId);
        } else {
            const product = appState.products.find(p => p.id === productId);
            if (product) this.items.push(product);
        }
        this.save();
        this.notify();
    }
    save() {
        localStorage.setItem('wishlist_items', JSON.stringify(this.items));
    }
    load() {
        const saved = localStorage.getItem('wishlist_items');
        if (saved) {
            this.items = JSON.parse(saved);
        }
        this.notify();
    }
}

const cart = new Cart();
const wishlist = new Wishlist();
