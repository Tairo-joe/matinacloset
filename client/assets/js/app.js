const App = (() => {
  const USER_KEY = 'mc_user';

  function setUser(u) { if (!u) localStorage.removeItem(USER_KEY); else localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function getUser() { const x = localStorage.getItem(USER_KEY); try { return x ? JSON.parse(x) : null; } catch { return null; } }

  async function initNavbar() {
    const user = getUser();
    const el = document.querySelector('#navbarAuth');
    if (!el) return;
    if (user) {
      el.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-danger dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/user-login-5504124-4585176.png" alt="Account" class="icon-logout">
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="/account.html">Orders</a></li>
            ${user.role === 'admin' ? '<li><a class="dropdown-item" href="/admin/index.html">Admin</a></li>' : ''}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
          </ul>
        </div>
      `;
      document.querySelector('#logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        API.auth.setToken(null);
        setUser(null);
        window.location.href = '/';
      });
    } else {
      el.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" id="authDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/user-login-5504124-4585176.png" alt="Account" class="icon-logout">
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="authDropdown">
            <li><a class="dropdown-item" href="/login.html">Login</a></li>
            <li><a class="dropdown-item" href="/register.html">Register</a></li>
          </ul>
        </div>
      `;
    }
  }

  async function refreshSession() {
    const current = getUser();
    const me = await API.auth.me();
    if (me.user) setUser(me.user); else setUser(null);
    if (!!current !== !!me.user) await initNavbar();
    return me.user;
  }

  function requireAdmin() {
    const u = getUser();
    if (!u || u.role !== 'admin') {
      window.location.replace('/login.html');
      return false;
    }
    return true;
  }

  return { setUser, getUser, initNavbar, refreshSession, requireAdmin };
})();
