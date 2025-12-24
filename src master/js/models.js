class Product {
    constructor(id, name, price, category, image, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.image = image;
        this.description = description;
    }

    displayInfo(isWishlisted, wishlistToggleFn, addToCartFn) {
        return `
        <div class="product-card" data-id="${this.id}">
            <div class="product-image-container">
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="${wishlistToggleFn}(${this.id}, event)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                </button>
                <img src="${this.image}" alt="${this.name}" class="product-image" />
            </div>
            <div class="product-details">
                <span class="product-category">${this.category}</span>
                <h3 class="product-name">${this.name}</h3>
                <p class="product-description">${this.description}</p>
                <div class="product-footer">
                    <span class="product-price"> ETB ${this.price.toFixed(2)}</span>
                    <button class="btn-add-to-cart" onclick="${addToCartFn}(${this.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
        `;
    }
}

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.createdAt = new Date();
    }

    validatePassword() {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(this.password);
    }

    validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    validateUsername() {
        const usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
        return usernameRegex.test(this.username);
    }
}

class Order {
    constructor(cartItems, userInfo) {
        this.id = Math.floor(Math.random() * 1000000);
        this.items = [...cartItems];
        this.userInfo = { ...userInfo };
        this.timestamp = new Date();
        this.total = this.calculateTotal();
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    displaySummary() {
        return `Order #${this.id} - Total: ETB ${this.total.toLocaleString()} - Date: ${this.timestamp.toLocaleString()}`;
    }
}
