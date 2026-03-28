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

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: var(--primary);"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
