document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize State
  checkSession();
  cart.load();
  wishlist.load();
  renderProducts();
  cart.updateCartBadge();
  showView("home-view")();

  // 2. Attach Global Event Listeners

  //search functionality
  const searchInput = document.getElementById("product-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderProducts(appState.selectedCategory, e.target.value);
    });
  }

  // Category Filtering
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const category = e.target.getAttribute("data-category") || "all";
      appState.selectedCategory = category;

      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      renderProducts(category, searchInput?.value);
    });
  });

  // Navigation Mapping
  const navMap = {
    "nav-home": "home-view",
    "nav-products": "products-view",
    "nav-wishlist": "wishlist-view",
    "nav-about": "about-view",
    "nav-contact": "contact-view",
    "nav-cart": "cart-view",
    "nav-login": "login-view",
    "nav-register": "register-view",
  };

  Object.entries(navMap).forEach(([id, view]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        showView(view)();
        if (view === "cart-view") renderCart();
        if (view === "wishlist-view") renderWishlist();
      });
    }
  });

  // Register Form
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg-username").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;
      const confirm = document.getElementById("reg-confirm-password").value;

      const formData = new FormData(registerForm);

      clearAllErrors(
        "reg-username",
        "reg-email",
        "reg-password",
        "reg-confirm-password",
      );

      let isValid = true;
      if (!validators.username(username)) {
        showError(
          "reg-username",
          "Username must be 3-16 alphanumeric characters",
        );
        isValid = false;
      }
      if (!validators.email(email)) {
        showError("reg-email", "Please enter a valid email address");
        isValid = false;
      }
      if (!validators.password(password)) {
        showError(
          "reg-password",
          "Password must be 8+ chars with uppercase, lowercase, number, and special char",
        );
        isValid = false;
      }
      if (password !== confirm) {
        showError("reg-confirm-password", "Passwords do not match");
        isValid = false;
      }

      // Sending form data
      try {
        const response = await fetch(
          "http://localhost:8000/api/auth/register.php",
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (result.status === "success") {
          appState.currentUser = new User(username, email, password);
          showNotification(`Welcome, ${username}! Registration successful.`);
          showView("products-view")();
          registerForm.reset();
          window.location.href = "index.html#products-view";
        } else {
          const profileError = document.getElementById("image-error");
          profileError.innerHTML = result.message;
          profileError.classList = "image-error";
        }
      } catch (error) {
        console.log(error);
      }
    });
  }

  // Login Form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      clearAllErrors("login-email", "login-password");

      if (!validators.email(email)) {
        showError("login-email", "Please enter a valid email address");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include"
        });

        const result = await response.json();

        if (response.ok) {
          appState.currentUser = new User("User", email, ""); // Password omitted for security
          showNotification(`Welcome! Login successful.`);
          showView("products-view")();
          loginForm.reset();
        } else {
          showNotification(result.error || "Login failed", "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showNotification("Could not connect to authentication server", "error");
      }
    });
  }

  async function checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session.php`, { credentials: "include" });
      const result = await response.json();
      if (result.logged_in) {
        appState.currentUser = new User(result.username || "User", "", "");
        console.log("Session active:", result.username);
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  }

  // Checkout Form
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (cart.items.length === 0) return alert("Your cart is empty!");

      const formData = {
        fullName: document.getElementById("checkout-name").value,
        email: document.getElementById("checkout-email").value,
        city: document.getElementById("checkout-city").value,
      };

      const order = new Order(cart.items, formData);
      appState.orders.push(order);
      cart.clear();
      showNotification("Order placed successfully! Order ID: #" + order.id);
      showView("products-view")();
      checkoutForm.reset();
    });
  }

  console.log("=== CARTIFY 2.0 LOCAL INITIALIZED ===");
});
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("open");
});
