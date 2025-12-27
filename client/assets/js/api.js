// MatinaCloset API client
const API = (() => {
  const BASE = '/api';
  const TOKEN_KEY = 'mc_token';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(tok) { if (!tok) localStorage.removeItem(TOKEN_KEY); else localStorage.setItem(TOKEN_KEY, tok); }
  function authHeader() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  async function request(path, opts = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}, authHeader());
    
    console.log(`🌐 API Request: ${opts.method || 'GET'} ${BASE}${path}`);
    console.log('🔑 Auth token:', getToken() ? 'Present' : 'Missing');
    
    const res = await fetch(`${BASE}${path}`, Object.assign({}, opts, { headers }));
    
    console.log(`📡 API Response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      let err = 'Request failed';
      try { 
        const data = await res.json(); 
        err = data.error || data.message || err;
        console.error('❌ API Error Details:', data);
      } catch (_) { 
        console.error('❌ API Error (no details):', res.statusText);
      }
      throw new Error(err);
    }
    
    const text = await res.text();
    try { 
      const result = text ? JSON.parse(text) : {};
      console.log('✅ API Success:', result);
      return result;
    } catch { 
      console.log('✅ API Success (raw text):', text);
      return text; 
    }
  }

  const auth = {
    async register({ name, email, password }) { return request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }); },
    async login({ email, password }) { return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); },
    async me() { return request('/auth/me'); },
    setToken,
    getToken,
  };

  const products = {
    async list(filters = {}) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filters)) if (v !== undefined && v !== null && v !== '') params.set(k, v);
      return request(`/products?${params.toString()}`);
    },
    async categories() { return request('/products/filters/categories'); },
    async get(id) { return request(`/products/${id}`); },
    async reviews(id) { return request(`/products/${id}/reviews`); },
    async create(payload) { return request('/products', { method: 'POST', body: JSON.stringify(payload) }); },
    async update(id, payload) { return request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); },
    async remove(id) { return request(`/products/${id}`, { method: 'DELETE' }); },
  };

  const reviews = {
    async add(productId, { rating, comment }) { return request(`/reviews/${productId}`, { method: 'POST', body: JSON.stringify({ rating, comment }) }); },
  };

  const cart = {
    async get() { return request('/cart'); },
    async add(productId, quantity = 1, size = null, color = null) { 
      console.log(`🛒 Adding to cart: Product ID ${productId}, Quantity ${quantity}, Size ${size}, Color ${color}`);
      
      // Validate inputs
      if (!productId || productId <= 0) {
        console.error('❌ Invalid product ID:', productId);
        throw new Error('Invalid product ID');
      }
      
      if (!quantity || quantity <= 0) {
        console.error('❌ Invalid quantity:', quantity);
        throw new Error('Invalid quantity');
      }
      
      const payload = { productId, quantity, size, color };
      console.log('📦 Cart payload:', payload);
      
      return request('/cart', { method: 'POST', body: JSON.stringify(payload) }); 
    },
    async update(productId, quantity, size = null, color = null) { 
      console.log(`🔄 Updating cart: Product ID ${productId}, Quantity ${quantity}`);
      return request(`/cart/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity, size, color }) }); 
    },
    async remove(productId, size = null, color = null) { 
      console.log(`🗑️ Removing from cart: Product ID ${productId}`);
      const params = new URLSearchParams();
      if (size) params.set('size', size);
      if (color) params.set('color', color);
      return request(`/cart/${productId}?${params.toString()}`, { method: 'DELETE' }); 
    },
    async merge(items) { 
      console.log('🔗 Merging cart items:', items);
      return request('/cart/merge', { method: 'POST', body: JSON.stringify({ items }) }); 
    },
  };

  const orders = {
    async mine() { return request('/orders/mine'); },
    async checkout(customer) { return request('/orders/checkout', { method: 'POST', body: JSON.stringify(customer || {}) }); },
  };

  const admin = {
    async overview() { return request('/admin/overview'); },
    async orders() { return request('/admin/orders'); },
    async categories() { return request('/admin/categories'); },
    async renameCategory(oldName, nextName) { return request('/admin/categories/rename', { method: 'POST', body: JSON.stringify({ old: oldName, next: nextName }) }); },
  };

  return { auth, products, reviews, cart, orders, admin };
})();
