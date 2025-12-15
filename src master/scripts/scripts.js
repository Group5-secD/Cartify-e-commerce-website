//product customer /chapter 4 constructor function
function Product(id, name, price, category, image, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
    this.image = image;
    this.description = description;
}

// Prototype Methods (Efficient Memory Usage via Inheritance)
Product.prototype.displayInfo = function() {
    return `
    <div class="product-card" data-id="${this.id}">
        <div class="product-image-container">
        <img src="${this.image}" alt="${this.name}" class="product-image" />
        </div>
        <div class="product-details">
            <span class="product-category">${this.category}</span>
            <h3 class="product-name">${this.name}</h3>
            <p class="product-description">${this.description}</p>
            <div class="product-footer">
            <span class="product-price">$${this.price.toFixed(2)}</span>
            <button class="btn-add-to-cart" onclick="cart.add(${this.id})">
            Add to Cart
            </button>
        </div>
        </div>
    </div>
    `;
};

// user costumer/ chapter 4 object oriented design
function User(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = new Date(); // Built-in Date object
}

// Prototype Methods for User
User.prototype.validatePassword = function() {
  // Regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(this.password);
};

User.prototype.validateEmail = function() {
  // Regex: Standard email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
};

User.prototype.validateUsername = function() {
  // Regex: Alphanumeric, 3-16 characters
    var usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
    return usernameRegex.test(this.username);
};

// order costumer
function Order(cartItems, userInfo) {
    this.id = Math.floor(Math.random() * 1000000); // Math object for random ID
    this.items = cartItems.slice(); // Create copy of array
    this.serInfo = Object.assign({}, userInfo); // Object.assign()
    this.timestamp = new Date();
    this.total = this.calculateTotal();
}

Order.prototype.calculateTotal = function() {
    var sum = 0;
    for (var i = 0; i < this.items.length; i++) {
        sum += this.items[i].price * this.items[i].quantity;
    }
    return sum;
};

Order.prototype.displaySummary = function() {
    return 'Order #' + this.id + ' - Total: $' + this.total.toFixed(2) + ' - Date: ' + this.timestamp.toLocaleString();
};

// ========== CART OBJECT (Chapter 4: Objects with Getters/Setters) ==========
var cart = {
    items: [], 
  // Getter (Accessor Property) - ES5 compatible
    get total() {
    var sum = 0;
    for (var i = 0; i < this.items.length; i++) {
      sum += this.items[i].price * this.items[i].quantity;
    }
    return sum;
    },

    get itemCount() {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        count += this.items[i].quantity;
    }
    return count;
    },

  // Methods
    add: function(productId) {
    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
        product = products[i];
        break;
        }
    }
    
    if (!product) return;

    var existingItem = null;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].id === productId) {
        existingItem = this.items[i];
        break;
        }
    }
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
        });
    }

    this.render();
    this.updateCartBadge();
    this.showNotification(product.name + ' added to cart!');
    },

    remove: function(productId) {
    var newItems = [];
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].id !== productId) {
        newItems.push(this.items[i]);
        }
    }
    this.items = newItems;
    this.render();
    this.updateCartBadge();
    },

    updateQuantity: function(productId, newQuantity) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].id === productId) {
        if (newQuantity <= 0) {
            this.remove(productId);
        } else {
            this.items[i].quantity = newQuantity;
            this.render();
            this.updateCartBadge();
        }
        break;
        }
    }
    },

    clear: function() {
    this.items = [];
    this.render();
    this.updateCartBadge();
    },

    render: function() {
    var cartContainer = document.getElementById('cart-items');
    var emptyMessage = document.getElementById('cart-empty');
    var cartSummary = document.getElementById('cart-summary');

    if (this.items.length === 0) {
        cartContainer.innerHTML = '';
        emptyMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
    }

    emptyMessage.style.display = 'none';
    cartSummary.style.display = 'block';

    // Object Traversal using loops
    var html = '';
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        html += `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
            <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-total">
            $${(item.price * item.quantity).toFixed(2)}
            </div>
        <button class="cart-item-remove" onclick="cart.remove(${item.id})">×</button>
        </div>
        `;
    }

    cartContainer.innerHTML = html;
    document.getElementById('cart-total').textContent = '$' + this.total.toFixed(2);
    },

    updateCartBadge: function() {
    var badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = this.itemCount;
        badge.style.display = this.itemCount > 0 ? 'flex' : 'none';
    }
    },

    showNotification: function(message) {
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.classList.add('show');
    }, 10);

    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
        notification.remove();
        }, 300);
    }, 2000);
    }
};


//mock product data / as per per requirement
var products = [
    new Product(1, 'Wireless Headphones', 79.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Premium sound quality with noise cancellation'),
    new Product(2, 'Smart Watch', 199.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Track your fitness and stay connected'),
    new Product(3, 'Laptop Backpack', 49.99, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'Durable and spacious for daily use'),
    new Product(4, 'Coffee Maker', 89.99, 'Home', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', 'Brew perfect coffee every morning'),
    new Product(5, 'Running Shoes', 119.99, 'Sports', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Comfortable and lightweight design'),
    new Product(6, 'Desk Lamp', 34.99, 'Home', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 'Adjustable LED lighting for your workspace'),
    new Product(7, 'Yoga Mat', 29.99, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 'Non-slip surface for your practice'),
    new Product(8, 'Bluetooth Speaker', 59.99, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'Portable with powerful bass'),
];

// app state data
var appState = {
    currentUser: null,
    currentView: 'products',
    selectedCategory: 'all',
    orders: []
};

// validation function (Using Regex)
var validators = {
    email: function(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
    },
  
    password: function(password) {
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
    },
  
    username: function(username) {
    var usernameRegex = /^[a-zA-Z0-9]{3,16}$/;
    return usernameRegex.test(username);
    },
  
    phone: function(phone) {
    var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
    },
  
    zipCode: function(zip) {
    var zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
    },

    name: function(name) {
    var nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
    },

    address: function(address) {
    return address.length >= 5 && address.length <= 100;
    }
};

// rendering function/ what is shown
function renderProducts(filterCategory) {
    var category = filterCategory || 'all';
    var container = document.getElementById('products-grid');
    if (!container) return;

  // Filter products
    var filteredProducts = [];
    if (category === 'all') {
    filteredProducts = products;
    } else {
    for (var i = 0; i < products.length; i++) {
        if (products[i].category === category) {
        filteredProducts.push(products[i]);
        }
    }
    }
    // Use prototype method to generate HTML
    var html = '';
    for (var i = 0; i < filteredProducts.length; i++) {
    html += filteredProducts[i].displayInfo();
    }
    container.innerHTML = html;
}

// navigation function (Function Expressions & Closures) 
function showView(viewName) {
  // Closure: Maintains access to viewName
    return function() {
    // Hide all views
    var views = ['products-view', 'cart-view', 'login-view', 'register-view', 'checkout-view'];
    for (var i = 0; i < views.length; i++) {
        var element = document.getElementById(views[i]);
        if (element) element.style.display = 'none';
    }

    // Show selected view
    var selectedView = document.getElementById(viewName);
    if (selectedView) {
        selectedView.style.display = 'block';
        appState.currentView = viewName;
    }

    // Update nav active state
    var navLinks = document.querySelectorAll('.nav-link');
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.remove('active');
    }
    };
}

// form handler// basically how the feedback works
function showError(inputId, message) {
    var input = document.getElementById(inputId);
    if (!input) return;
  
    var errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    }
    input.classList.add('input-error');
}

function clearError(inputId) {
    var input = document.getElementById(inputId);
    if (!input) return;
  
    var errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
    errorDiv.style.display = 'none';
    }
    input.classList.remove('input-error');
}

function clearAllErrors() {
  // Using arguments object (Function feature)
    for (var i = 0; i < arguments.length; i++) {
    clearError(arguments[i]);
    }
}
