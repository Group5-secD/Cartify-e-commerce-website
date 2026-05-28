document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize State
  checkSession();
  cart.load();
  wishlist.load();
  renderProducts();
  renderFeaturedProducts();
  cart.updateCartBadge();
  showView("home-view")();

  // Handle successful checkout redirect
  if (window.location.search.includes('checkout=success')) {
    cart.clear();
    showNotification("Order placed successfully!", "success");
    // Clean up the URL and show orders
    window.history.replaceState({}, document.title, window.location.pathname + "#customer-orders-view");
    showView("customer-orders-view")();
  }

  // Theme Logic
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };
  
  if (getCookie("theme") === "dark") {
    document.body.classList.add("dark-theme");
    if (themeIcon) themeIcon.textContent = "☀️";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const isDark = document.body.classList.contains("dark-theme");
      document.cookie = `theme=${isDark ? "dark" : "light"}; max-age=31536000; path=/`;
      if (themeIcon) themeIcon.textContent = isDark ? "☀️" : "🌙";
    });
  }

  // Sticky Header Scroll Logic
  const headerEl = document.querySelector(".header");
  if (headerEl) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        headerEl.classList.add("scrolled");
      } else {
        headerEl.classList.remove("scrolled");
      }
    });
  }

  // 2. Attach Global Event Listeners

  //search functionality
  const searchInput = document.getElementById("product-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderProducts(appState.selectedCategory, e.target.value);
    });
  }

  // Category Fetching & Filtering
  const loadCategories = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/categories");
      const data = await res.json();
      
      const filterContainer = document.getElementById("store-category-filters");
      const vendorSelect = document.getElementById("prod-category");
      
      if (data && Array.isArray(data)) {
        // Add dynamic filters
        if (filterContainer) {
          data.forEach(c => {
            const btn = document.createElement("button");
            btn.className = "category-btn";
            btn.setAttribute("data-category", c.categoryname);
            btn.textContent = c.categoryname;
            filterContainer.appendChild(btn);
          });
        }
        // Populate vendor select
        if (vendorSelect) {
          vendorSelect.innerHTML = data.map(c => `<option value="${c.categoryID}">${c.categoryname}</option>`).join("");
        }
      }
      
      // Bind event listeners for category filters
      document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const category = e.target.getAttribute("data-category") || "all";
          appState.selectedCategory = category;

          document
            .querySelectorAll(".category-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          renderProducts(category, document.getElementById("product-search")?.value);
        });
      });
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };
  loadCategories();

  // Navigation Mapping
  const navMap = {
    "nav-home": "home-view",
    "nav-products": "products-view",
    "nav-wishlist": "wishlist-view",
    "nav-about": "about-view",
    "nav-contact": "contact-view",
    "nav-cart": "cart-view",
    "nav-vendor-dashboard": "vendor-dashboard-view",
    "nav-vendor-products": "vendor-products-view",
    "nav-vendor-orders": "vendor-orders-view",
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

      const formData = new FormData(registerForm);
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      clearAllErrors(
        "reg-username",
        "reg-email",
        "reg-password",
        "reg-confirm-password",
      );

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Creating Account...';
        }

        const response = await fetch(
          `${API_BASE_URL}/api/auth/register_api.php`,
          {
            method: "POST",
            body: formData,
          },
        );

        const result = await response.json();

        if (result.status === "success") {
          showNotification('Success! Account created.', 'success');
          setTimeout(() => {
            showView('login-view')();
            registerForm.reset();
            const nameDisplay = document.querySelector('.file-name');
            if (nameDisplay) nameDisplay.textContent = 'No file chosen';
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Create Account';
            }
          }, 1500);
        } else {
          if (result.field) {
            showError(result.field, result.message);
          } else {
            showNotification(result.message || "Registration failed", "error");
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        showNotification("Server connection error", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
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
      const remember_me = document.getElementById("login-remember") ? document.getElementById("login-remember").checked : false;

      clearAllErrors("login-email", "login-password");

      // Frontend validation skipped here; backend handles the email format check.

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, remember_me }),
          credentials: "include",
        });

        const result = await response.json();

        if (result.status === "success") {
          appState.currentUser = new User(
            result.username || "User",
            email,
            "",
            result.profile_picture,
            result.role || "customer",
            result.business_name || null
          );
          
          await cart.syncToBackend();
          
          showNotification(`Welcome, ${result.username}! Login successful.`);
          if (result.role === 'vendor') {
            showView("vendor-dashboard-view")();
          } else {
            showView("products-view")();
          }
          updateAuthUI();
          loginForm.reset();
          window.location.href = result.role === 'vendor' ? "index.html#vendor-dashboard-view" : "index.html#products-view";
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
          result.role || "customer",
          result.business_name || null
        );
        console.log("Session active:", result.username);
      } else {
        appState.currentUser = null;
      }
      updateAuthUI();
    } catch (error) {
      console.error("Session check failed:", error);
      appState.currentUser = null;
      updateAuthUI();
    }
  }

  function updateAuthUI() {
    const loginBtn = document.getElementById("nav-login");
    const logoutBtn = document.getElementById("nav-logout");
    const registerNav = document.getElementById("nav-register");
    const profileNav = document.getElementById("user-profile-nav");
    const navUsername = document.getElementById("nav-username");
    const navUserImg = document.getElementById("nav-user-img");

    // Vendor and Customer Navigation Links
    const wishlistNav = document.getElementById("nav-wishlist");
    const cartNav = document.getElementById("nav-cart");
    const cartIcon = document.getElementById("nav-cart-icon");
    const vendorDashboardNav = document.getElementById("nav-vendor-dashboard");
    const vendorProductsNav = document.getElementById("nav-vendor-products");
    const vendorOrdersNav = document.getElementById("nav-vendor-orders");
    const customerOrdersNav = document.getElementById("nav-customer-orders");
    const notifContainer = document.getElementById("notification-dropdown-container");

    if (appState.currentUser) {
      if (typeof fetchNotifications === 'function') fetchNotifications();
      if (loginBtn) loginBtn.style.display = "none";
      if (registerNav) registerNav.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "block";
      if (profileNav) {
        profileNav.style.display = "flex";
        profileNav.style.alignItems = "center";
        
        const dropdownUsername = document.getElementById("dropdown-username");
        const dropdownRole = document.getElementById("dropdown-role");
        const dropdownUserImg = document.getElementById("dropdown-user-img");

        if (navUsername) navUsername.textContent = appState.currentUser.username;
        if (dropdownUsername) dropdownUsername.textContent = appState.currentUser.username;
        if (dropdownRole) dropdownRole.textContent = appState.currentUser.role || 'customer';

        if (navUserImg || dropdownUserImg) {
          let imgSrc;
          if (appState.currentUser.profilePicture) {
            imgSrc = appState.currentUser.profilePicture.startsWith('http') 
              ? appState.currentUser.profilePicture 
              : `${API_BASE_URL}/api/auth/${appState.currentUser.profilePicture}`;
          } else {
            imgSrc = `https://ui-avatars.com/api/?name=${appState.currentUser.username}&background=ecfdf5&color=10b981`;
          }
          
          if (navUserImg) {
            navUserImg.src = imgSrc;
            navUserImg.style.display = "block";
          }
          if (dropdownUserImg) {
            dropdownUserImg.src = imgSrc;
            dropdownUserImg.style.display = "block";
          }
        }
      }

      // Toggle role-based links
      if (appState.currentUser.role === 'vendor') {
        if (wishlistNav) wishlistNav.style.display = "none";
        if (cartNav) cartNav.style.display = "none";
        if (cartIcon) cartIcon.style.display = "none";
        if (customerOrdersNav) customerOrdersNav.style.display = "none";
        if (vendorDashboardNav) vendorDashboardNav.style.display = "block";
        if (vendorProductsNav) vendorProductsNav.style.display = "block";
        if (vendorOrdersNav) vendorOrdersNav.style.display = "block";
        if (notifContainer) notifContainer.style.display = "inline-block";
      } else if (appState.currentUser.role === 'admin') {
        if (notifContainer) notifContainer.style.display = "inline-block";
      } else {
        if (wishlistNav) wishlistNav.style.display = "block";
        if (cartNav) cartNav.style.display = "block";
        if (cartIcon) cartIcon.style.display = "block";
        if (customerOrdersNav) customerOrdersNav.style.display = "block";
        if (vendorDashboardNav) vendorDashboardNav.style.display = "none";
        if (vendorProductsNav) vendorProductsNav.style.display = "none";
        if (vendorOrdersNav) vendorOrdersNav.style.display = "none";
        if (notifContainer) notifContainer.style.display = "none";
      }
    } else {
      if (loginBtn) loginBtn.style.display = "block";
      if (registerNav) registerNav.style.display = "block";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (profileNav) profileNav.style.display = "none";

      // Default guest links
      if (wishlistNav) wishlistNav.style.display = "block";
      if (cartNav) cartNav.style.display = "block";
      if (cartIcon) cartIcon.style.display = "block";
      if (vendorDashboardNav) vendorDashboardNav.style.display = "none";
      if (vendorProductsNav) vendorProductsNav.style.display = "none";
      if (vendorOrdersNav) vendorOrdersNav.style.display = "none";
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
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (cart.items.length === 0) return showNotification("Your cart is empty!", "error");

      const streetAddress = document.getElementById("checkout-address").value;
      const city = document.getElementById("checkout-city").value;
      const zipCode = document.getElementById("checkout-zip").value;
      const totalAmount = cart.total;
      const paymentMethodRadio = checkoutForm.querySelector('input[name="payment-method"]:checked');
      const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : 'chapa';
      
      const btn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      if (paymentMethod === 'paypal') {
        btn.textContent = "Redirecting to PayPal...";
      } else {
        btn.textContent = "Redirecting to " + (paymentMethod === 'cbe' ? "CBE" : paymentMethod === 'telebirr' ? "Telebirr" : "Chapa") + "...";
      }
      
      btn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/checkout/init`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streetAddress, city, zipCode, totalAmount, paymentMethod }),
          credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            showNotification("Please log in to proceed to checkout", "error");
            showView("login-view")();
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        if (response.ok && data.checkout_url) {
            window.location.href = data.checkout_url;
        } else {
            showNotification(data.error || "Checkout failed", "error");
            btn.textContent = originalText;
            btn.disabled = false;
        }
      } catch (err) {
          console.error("Checkout error:", err);
          showNotification("Could not connect to payment gateway", "error");
          btn.textContent = originalText;
          btn.disabled = false;
      }
    });
  }

  // Vendor Add Product Form Submission
  const addProductForm = document.getElementById("add-product-form");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const name = document.getElementById("prod-name").value;
      const price = parseFloat(document.getElementById("prod-price").value);
      const category_id = parseInt(document.getElementById("prod-category").value);
      const description = document.getElementById("prod-desc").value;
      const image_url = document.getElementById("prod-image").value;
      const stockQuantity = parseInt(document.getElementById("prod-stock").value) || 0;

      try {
        const response = await fetch(`${API_BASE_URL}/api/vendor/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price, category_id, description, image_url, stockQuantity }),
          credentials: "include"
        });

        const result = await response.json();

        if (result.status === "success") {
          showNotification("Product published successfully!");
          toggleAddProductForm();
          addProductForm.reset();
          renderVendorProducts();
        } else {
          showNotification(result.error || "Could not publish product", "error");
        }
      } catch (error) {
        console.error("Add product error:", error);
        showNotification("Server connection error", "error");
      }
    });
  }

  // Global delete product function
  window.deleteVendorProduct = async function(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/vendor/products/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
        credentials: "include"
      });

      const result = await response.json();

      if (result.status === "success") {
        showNotification("Product deleted successfully");
        renderVendorProducts();
      } else {
        showNotification(result.error || "Could not delete product", "error");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      showNotification("Server connection error", "error");
    }
  };

  console.log("=== CARTIFY 2.0 LOCAL INITIALIZED ===");
});
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("open");
});
