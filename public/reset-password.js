document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetPasswordForm');
    if (!form) return;

    const queryParams = new URLSearchParams(window.location.search);
    const resetToken = queryParams.get('resetToken');

    if (!resetToken) {
        window.location.href = 'forgot-password.html';
        return;
    }

    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    };
    const clearError = () => {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    };

    let errorEl = document.getElementById('resetPasswordError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'resetPasswordError';
        errorEl.style.display = 'none';
        form.parentNode.insertBefore(errorEl, form);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearError();

        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;

        if (!password || !confirmPassword) {
            showError('Please enter both password fields.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || 'Reset Password';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';
        }

        try {
            const res = await fetch('/resetpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword: password }),
            });

            const data = await res.json();
            if (!res.ok) {
                showError(data?.message || 'Password reset failed.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                return;
            }

            window.location.href = 'login.html';
        } catch (error) {
            showError('Network error. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});