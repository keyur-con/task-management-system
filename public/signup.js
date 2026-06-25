document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');

  if (!signupForm) return;

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json(); 

      if (response.ok) {
        alert(result.message || 'Signup successful! Please log in.');
        window.location.href = 'login.html';
      } else {
        alert(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Unable to connect to the server.');
    }
  });
});
