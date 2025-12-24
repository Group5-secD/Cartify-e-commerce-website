const validators = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password: (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password),
    username: (username) => /^[a-zA-Z0-9]{3,16}$/.test(username),
    phone: (phone) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone),
    zipCode: (zip) => /^\d{5}(-\d{4})?$/.test(zip),
    name: (name) => /^[a-zA-Z\s]{2,50}$/.test(name),
    address: (address) => address.length >= 5 && address.length <= 100
};

function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    input.classList.add('input-error');
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.style.display = 'none';
    }
    input.classList.remove('input-error');
}

function clearAllErrors(...inputIds) {
    inputIds.forEach(clearError);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px; color: var(--primary);"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
