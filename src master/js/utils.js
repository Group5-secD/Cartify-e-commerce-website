function showError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const errorDiv = input.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains("error-message")) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("error");
    errorDiv.classList.add("error");
  }
  input.classList.add("input-error");
}

function clearError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const errorDiv = input.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains("error")) {
    errorDiv.classList.remove("error");
    errorDiv.classList.add("error-message");
  }
  input.classList.remove("input-error");
}

function clearAllErrors(...inputIds) {
  inputIds.forEach(clearError);
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const icon =
    type === "success"
      ? '<polyline points="20 6 9 17 4 12"></polyline>'
      : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';

  const iconColor = type === "success" ? "var(--primary)" : "#ef4444";

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;">${icon}</svg>
            <span>${message}</span>
        </div>
    `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
