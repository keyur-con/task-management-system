document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    };
    const clearError = () => {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    };

    let errorEl = document.getElementById('loginError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'loginError';
        errorEl.style.display = 'none';
        form.parentNode.insertBefore(errorEl, form);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            showError('Please enter email and password.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || 'Log In';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
        }

        try {
            const res = await fetch('/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                showError(data?.message || 'Login failed');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                return;
            }

            window.location.href = 'profile.html';

        } catch (err) {
            showError('Network error. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});