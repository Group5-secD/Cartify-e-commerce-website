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

// cart object /Chapter 4: Objects with Getters/Setters
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
    new Product(1, 'Wireless Headphones', 79.99, 'Electronics', 'https://i5.walmartimages.com/seo/Lydiaunistar-Waterproof-Bluetooth-Earbuds-Wireless-Sports-Headphones-Noise-Cancelling-Stereo-Sound-15H-Playtime-Comfort-Foldable-Design-Gym-Running-T_c1a4a089-aa9f-4225-baeb-2f84ab39b96f.6e1f56815ec95dc0935ca994cb3b692a.jpeg', 'Premium sound quality with noise cancellation'),
    new Product(2, 'Smart Watch', 199.99, 'Electronics', 'https://sm.mashable.com/t/mashable_in/photo/default/redmi-watch_15wr.1200.jpg', 'Track your fitness and stay connected'),
    new Product(3, 'Laptop Backpack', 49.99, 'Accessories', 'https://i.pinimg.com/1200x/24/21/a0/2421a07892b7f02eed3ec73f92afa6c8.jpg', 'Durable and spacious for daily use'),
    new Product(4, 'Coffee Maker', 89.99, 'Home', 'https://i.pinimg.com/1200x/6d/ae/f1/6daef13dd0fd00426eb5fb70ee26ecff.jpg', 'Brew perfect coffee every morning'),
    new Product(5, 'Running Shoes', 119.99, 'Sports', 'https://i.pinimg.com/1200x/b3/3b/98/b33b9878ae8c7848ac450d32714d911f.jpg', 'Comfortable and lightweight design'),
    new Product(6, 'Desk Lamp', 34.99, 'Home', 'https://i.pinimg.com/1200x/5d/0c/2a/5d0c2a69797cc4c06b005a67ffdd1e1c.jpg', 'Adjustable LED lighting for your workspace'),
    new Product(7, 'Vienna Sofa', 34.99, 'Home', 'https://i.pinimg.com/736x/1a/11/c2/1a11c2734fbc205b078385b87f0e7566.jpg', 'Comfortable sofa with a modern design, ideal for living rooms and guest areas.'),
    new Product(8, 'Black Single Clover Gold Plated Necklace', 49.99, 'Accessories', 'https://i.pinimg.com/1200x/17/a7/2e/17a72ecdce94c131fa695913f7a03290.jpg', 'Elegant gold-plated necklace suitable for daily wear and special occasions.'),
    new Product(9, 'O AirPods Max original', 34.99, 'Electronics', 'https://i.pinimg.com/1200x/c0/84/43/c084439636bec268040bbcc792fe7f27.jpg', 'Over-ear wireless headphones with stylish design and rich audio output.'),
    new Product(10, 'Desk Lamp', 34.99, 'Electronics', 'https://i.pinimg.com/736x/2d/c4/c4/2dc4c4d9c81ae2fb381517c62d4bdb33.jpg', 'Adjustable LED lighting for your workspace'),
    new Product(11, 'Yoga Mat', 29.99, 'Sports', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 'Non-slip surface for your practice'),
    new Product(13, 'Bluetooth Speaker', 59.99, 'Electronics', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'Portable with powerful bass'),
    new Product(14, 'SLOVIC Dumbbells Set', 29.99, 'Sports', 'https://i.pinimg.com/736x/61/22/cb/6122cb2e189778ef56f9a77aa6eddbcf.jpg', 'Durable dumbbells set designed for home workouts and strength training.'),
    new Product(15, 'stainless steel silver men rings', 49.99, 'Accessories', 'https://i.pinimg.com/1200x/25/ab/5c/25ab5cfb89dc69f2f8a85c121fc0ba13.jpg', 'Stylish stainless steel ring designed for everyday men’s fashion.'),

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

//  initialization // this runs when dom is loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Register Form
    var registerForm = document.getElementById('register-form');
    if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
      
        var username = document.getElementById('reg-username').value;
        var email = document.getElementById('reg-email').value;
        var password = document.getElementById('reg-password').value;
        var confirmPassword = document.getElementById('reg-confirm-password').value;

        clearAllErrors('reg-username', 'reg-email', 'reg-password', 'reg-confirm-password');

        var isValid = true;

        if (!validators.username(username)) {
        showError('reg-username', 'Username must be 3-16 alphanumeric characters');
        isValid = false;
        }

        if (!validators.email(email)) {
        showError('reg-email', 'Please enter a valid email address');
        isValid = false;
        }

        if (!validators.password(password)) {
        showError('reg-password', 'Password must be 8+ chars with uppercase, lowercase, number, and special character');
        isValid = false;
        }

        if (password !== confirmPassword) {
        showError('reg-confirm-password', 'Passwords do not match');
        isValid = false;
        }

        if (isValid) {
        var newUser = new User(username, email, password);
        appState.currentUser = newUser;
        alert('Registration successful! Welcome, ' + username + '!');
        showView('products-view')();
        registerForm.reset();
        }
    });
    }

  // Login Form
    var loginForm = document.getElementById('login-form');
    if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var email = document.getElementById('login-email').value;
        var password = document.getElementById('login-password').value;

        clearAllErrors('login-email', 'login-password');

        var isValid = true;

        if (!validators.email(email)) {
        showError('login-email', 'Please enter a valid email address');
        isValid = false;
        }

        if (password.length < 1) {
        showError('login-password', 'Please enter your password');
        isValid = false;
        }

        if (isValid) {
        // Simulate login (no backend)
        appState.currentUser = new User('DemoUser', email, password);
        alert('Welcome back, ' + email + '!');
        showView('products-view')();
        loginForm.reset();
        }
    });
    }

  // Checkout Form
    var checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
        }

        var fullName = document.getElementById('checkout-name').value;
        var email = document.getElementById('checkout-email').value;
        var phone = document.getElementById('checkout-phone').value;
        var address = document.getElementById('checkout-address').value;
        var city = document.getElementById('checkout-city').value;
        var zipCode = document.getElementById('checkout-zip').value;

        clearAllErrors('checkout-name', 'checkout-email', 'checkout-phone', 'checkout-address', 'checkout-city', 'checkout-zip');

        var isValid = true;

        if (!validators.name(fullName)) {
        showError('checkout-name', 'Please enter a valid name (2-50 characters, letters only)');
        isValid = false;
        }

        if (!validators.email(email)) {
        showError('checkout-email', 'Please enter a valid email address');
        isValid = false;
        }

        if (!validators.phone(phone)) {
        showError('checkout-phone', 'Please enter a valid phone number (e.g., 123-456-7890)');
        isValid = false;
        }

        if (!validators.address(address)) {
        showError('checkout-address', 'Please enter a valid address (5-100 characters)');
        isValid = false;
        }

        if (!validators.name(city)) {
        showError('checkout-city', 'Please enter a valid city name');
        isValid = false;
        }

        if (!validators.zipCode(zipCode)) {
        showError('checkout-zip', 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)');
        isValid = false;
        }

        if (isValid) {
        // Create Order using Constructor
        var orderInfo = { 
            fullName: fullName, 
            email: email, 
            phone: phone, 
            address: address, 
            city: city, 
            zipCode: zipCode 
        };
        var newOrder = new Order(cart.items, orderInfo);
        appState.orders.push(newOrder);

        console.log('=== ORDER CREATED ===');
        console.log(newOrder.displaySummary());
        console.log('Order Details:', newOrder);
        console.log('Using Object.keys():', Object.keys(newOrder));
        console.log('Using Object.values():', Object.values(newOrder));
        
        alert('Order placed successfully!\n' + newOrder.displaySummary());
        
        cart.clear();
        showView('products-view')();
        checkoutForm.reset();
        }
     
    });
    }

  // Category Filter
    var categoryBtns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < categoryBtns.length; i++) {
    categoryBtns[i].addEventListener('click', function(e) {
        var category = e.target.getAttribute('data-category') || 'all';
        
        var allBtns = document.querySelectorAll('.category-btn');
        for (var j = 0; j < allBtns.length; j++) {
        allBtns[j].classList.remove('active');
        }
        e.target.classList.add('active');
      
        renderProducts(category);
    });
    }

  // Navigation
    var navProducts = document.getElementById('nav-products');
    if (navProducts) {
    navProducts.addEventListener('click', function() {
        showView('products-view')();
        navProducts.classList.add('active');
    });
    }

    var navCart = document.getElementById('nav-cart');
    if (navCart) {
    navCart.addEventListener('click', function() {
        showView('cart-view')();
        cart.render();
        });
    }

    var navLogin = document.getElementById('nav-login');
    if (navLogin) {
    navLogin.addEventListener('click', function() {
        showView('login-view')();
    });
    }

    var navRegister = document.getElementById('nav-register');
    if (navRegister) {
    navRegister.addEventListener('click', function() {
        showView('register-view')();
    });
    }

    var btnProceedCheckout = document.getElementById('btn-proceed-checkout');
    if (btnProceedCheckout) {
    btnProceedCheckout.addEventListener('click', function() {
        if (cart.items.length === 0) {
        alert('Your cart is empty!');
        return;
        }
        showView('checkout-view')();
    });
    }

    var btnContinueShopping = document.getElementById('btn-continue-shopping');
    if (btnContinueShopping) {
    btnContinueShopping.addEventListener('click', function() {
        showView('products-view')();
    });
    }

    var showRegisterLink = document.getElementById('show-register');
    if (showRegisterLink) {
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        showView('register-view')();
    });
    }

    var showLoginLink = document.getElementById('show-login');
    if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showView('login-view')();
    });
    }

  // INITIALIZATION
    renderProducts();
    cart.updateCartBadge();
    showView('products-view')();

    console.log('=== CARTIFY INITIALIZED ===');
    console.log('Demonstrating Object Traversal:');
    console.log('Product Keys:', Object.keys(products[0]));
    console.log('Product Values:', Object.values(products[0]));
    console.log('\nAll Products:');
    for (var i in products) {
    console.log('Product ' + i + ':', products[i].name);
    }
    console.log('\n Educational Concepts Demonstrated:');
    console.log('✓ Constructor Functions (Product, User, Order)');
    console.log('✓ Prototype Methods (displayInfo, validatePassword, etc.)');
    console.log('✓ Regular Expressions (Email, Password, Phone validation)');
    console.log('✓ Object Manipulation (Object.keys, Object.values, Object.assign)');
    console.log('✓ Function Closures (showView function)');
    console.log('✓ Getters/Setters (cart.total, cart.itemCount)');
    console.log('✓ Built-in Objects (Date, Math)');
    console.log('\n Try the features:');
    console.log('1. Browse products and add to cart');
    console.log('2. Register with validation (password must have 8+ chars, uppercase, lowercase, number, special char)');
    console.log('3. Complete checkout with form validation');
    console.log('4. Check console for order details!');
});

