document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    const showError = (msg) => {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    };
    const clearError = () => {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    };

    let errorEl = document.getElementById('forgotPasswordError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'forgotPasswordError';
        errorEl.style.display = 'none';
        form.parentNode.insertBefore(errorEl, form);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const email = document.getElementById('email')?.value?.trim();

        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || 'Send OTP';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            const res = await fetch('/forgetpassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) {
                showError(data?.message || 'Failed to send OTP');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                return;
            }

            window.location.href = `verify-otp.html?email=${encodeURIComponent(email)}`;

        } catch (err) {
            showError('Network error. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});