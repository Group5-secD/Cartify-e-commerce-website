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
    "nav-logout": null,
  };

    Object.entries(navMap).forEach(([id, view]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        if (id === "nav-logout") {
          logout();
          return;
        }
        showView(view)();
        if (view === "cart-view") renderCart();
        if (view === "wishlist-view") renderWishlist();
      });
    }
  });

  // Profile Dropdown Toggle
  const profileTrigger = document.getElementById("profile-trigger");
  const profileMenu = document.getElementById("profile-dropdown-menu");

  if (profileTrigger && profileMenu) {
    profileTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      profileMenu.classList.remove("show");
    });
  }

  // Register Form
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("reg-username").value;
      const email = document.getElementById("reg-email").value;
      const password = document.getElementById("reg-password").value;

      const formData = new FormData(registerForm);

      clearAllErrors(
        "reg-username",
        "reg-email",
        "reg-password",
        "reg-confirm-password",
      );

      // Sending form data
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/register_api.php`,
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
          updateAuthUI();
          registerForm.reset();
          window.location.href = "index.html#products-view";
        } else {
          if (result.field) {
            showError(result.field, result.message);
          } else {
            alert(result.message);
          }
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

      // Frontend validation skipped here; backend handles the email format check.

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const result = await response.json();

        if (result.status === "success") {
          appState.currentUser = new User(
            result.username || "User",
            email,
            "",
            result.profile_picture,
          );
          showNotification(`Welcome, ${result.username}! Login successful.`);
          showView("products-view")();
          updateAuthUI();
          loginForm.reset();
          window.location.href = "index.html#products-view";
        } else {
          showNotification(result.message || "Login failed", "error");
        }
      } catch (error) {
        console.error("Login error:", error);
        showNotification("Could not connect to authentication server", "error");
      }
    });
  }

  async function checkSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/session.php`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.logged_in) {
        appState.currentUser = new User(
          result.username || "User",
          "",
          "",
          result.profile_picture,
        );
        console.log("Session active:", result.username);
      }
      updateAuthUI();
    } catch (error) {
      console.error("Session check failed:", error);
    }
  }

  function updateAuthUI() {
    const loginBtn = document.getElementById("nav-login");
    const logoutBtn = document.getElementById("nav-logout");
    const registerNav = document.getElementById("nav-register");
    const profileNav = document.getElementById("user-profile-nav");
    const navUsername = document.getElementById("nav-username");
    const navUserImg = document.getElementById("nav-user-img");

    if (appState.currentUser) {
      if (loginBtn) loginBtn.style.display = "none";
      if (registerNav) registerNav.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (profileNav) {
        profileNav.style.display = "flex";
        profileNav.style.alignItems = "center";
        if (navUsername) navUsername.textContent = appState.currentUser.username;
        if (navUserImg) {
          if (appState.currentUser.profilePicture) {
            navUserImg.src = `${API_BASE_URL}/api/auth/${appState.currentUser.profilePicture}`;
            navUserImg.style.display = "block";
          } else {
            navUserImg.style.display = "none";
          }
        }
      }
    } else {
      if (loginBtn) loginBtn.style.display = "block";
      if (registerNav) registerNav.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (profileNav) profileNav.style.display = "none";
    }
  }

  async function logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout.php`, {
        credentials: "include",
      });
      const result = await response.json();
      if (result.status === "success") {
        appState.currentUser = null;
        cart.clear();
        wishlist.clear();
        showNotification("Logged out successfully");
        updateAuthUI();
        showView("home-view")();
      }
    } catch (error) {
      console.error("Logout failed:", error);
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
