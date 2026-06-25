const urlParams = new URLSearchParams(window.location.search);

document.addEventListener('DOMContentLoaded', function () {
  var emailEl = document.getElementById('userEmail');
  var logoutBtn = document.getElementById('logoutBtn');

  if (emailEl) emailEl.textContent = 'Loading...';

  fetch('/profile', {
    method: 'GET',
    credentials: 'include', // sends cookie automatically
    headers: { 'Content-Type': 'application/json' }
  })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var msg = (data && data.message) ? data.message : 'Failed to load profile';
          throw new Error(msg);
        }
        return data;
      });
    })
    .then(function (data) {
      if (data && data.user && data.user.email) {
        if (emailEl) emailEl.textContent = data.user.email;
      } else {
        if (emailEl) emailEl.textContent = 'No user info';
      }
    })
    .catch(function (err) {
      console.error('Profile fetch error:', err);
      try { localStorage.removeItem('token'); } catch (e) {}
      window.location.href = 'login.html';
    });

  if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
          await fetch('/logout', {
              method: 'POST',
              credentials: 'include'
          });
          window.location.href = 'login.html';
      });
  }
});
