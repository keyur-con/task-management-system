document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verifyOtpForm');
    if (!form) return;

    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get('email');

    if (!email) {
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

    let errorEl = document.getElementById('verifyOtpError');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'verifyOtpError';
        errorEl.style.display = 'none';
        form.parentNode.insertBefore(errorEl, form);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearError();

        const otp = document.getElementById('otp')?.value?.trim();
        if (!otp || otp.length !== 6) {
            showError('Please enter the 6-digit OTP.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || 'Verify OTP';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verifying...';
        }

        try {
            const res = await fetch('/verifyotp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();
            if (!res.ok) {
                showError(data?.message || 'OTP verification failed.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
                return;
            }

            window.location.href =`reset-password.html?resetToken=${data.resetToken}`;
        } catch (error) {
            showError('Network error. Please try again.');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
});