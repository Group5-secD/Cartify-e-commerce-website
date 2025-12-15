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
