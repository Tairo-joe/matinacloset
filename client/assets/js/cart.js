const Cart = (() => {
  const KEY = 'mc_cart';
  function getLocal() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
  function setLocal(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }
  function addLocal(productId, quantity = 1, size = null, color = null) {
    const cart = getLocal();
    const idx = cart.findIndex(i => i.productId === productId && i.size === size && i.color === color);
    if (idx >= 0) cart[idx].quantity += quantity; else cart.push({ productId, quantity, size, color });
    setLocal(cart);
  }
  function updateLocal(productId, quantity, size = null, color = null) {
    const cart = getLocal();
    const idx = cart.findIndex(i => i.productId === productId && i.size === size && i.color === color);
    if (idx >= 0) cart[idx].quantity = quantity;
    setLocal(cart);
  }
  function removeLocal(productId, size = null, color = null) {
    const cart = getLocal().filter(i => !(i.productId === productId && i.size === size && i.color === color));
    setLocal(cart);
  }
  async function mergeLocalToServer() {
    const token = API.auth.getToken();
    if (!token) return;
    const items = getLocal();
    if (!items.length) return;
    
    console.log('🛒 Merging local cart to server:');
    console.log('   Items to merge:', items);
    console.log('   Token present:', !!token);
    
    try {
      await API.cart.merge(items);
      console.log('✅ Cart merge successful');
      setLocal([]);
    } catch (error) {
      console.error('❌ Cart merge failed:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error type:', error.name);
      
      // Don't clear local storage on error - keep items for retry
      console.log('🔄 Keeping local cart items due to merge error');
      
      // Show user-friendly error
      if (typeof UI !== 'undefined' && UI.toast) {
        UI.toast('Failed to sync cart: ' + error.message);
      }
    }
  }
  async function list() {
    const token = API.auth.getToken();
    if (token) {
      try {
        return await API.cart.get();
      } catch (error) {
        console.error('Error fetching bag from server:', error);
        // Fall back to local storage if server fails
        const items = getLocal();
        const enriched = [];
        for (const i of items) {
          try {
            const p = await API.products.get(i.productId);
            enriched.push({ productId: i.productId, quantity: i.quantity, price: p.price, Product: p });
          } catch (productError) {
            console.error('Error fetching product:', i.productId, productError);
          }
        }
        return enriched;
      }
    } else {
      const items = getLocal();
      const enriched = [];
      for (const i of items) {
        try {
          const p = await API.products.get(i.productId);
          enriched.push({ productId: i.productId, quantity: i.quantity, price: p.price, Product: p });
        } catch (productError) {
          console.error('Error fetching product:', i.productId, productError);
        }
      }
      return enriched;
    }
  }
  async function add(productId, quantity = 1, size = null, color = null) {
    const token = API.auth.getToken();
    if (token) {
      try {
        return await API.cart.add(productId, quantity, size, color);
      } catch (error) {
        console.error('Error adding to bag:', error);
        addLocal(productId, quantity, size, color);
      }
    } else {
      addLocal(productId, quantity, size, color);
    }
  }
  async function update(productId, quantity, size = null, color = null) {
    const token = API.auth.getToken();
    if (token) {
      try {
        return await API.cart.update(productId, quantity, size, color);
      } catch (error) {
        console.error('Error updating bag:', error);
        updateLocal(productId, quantity, size, color);
      }
    } else {
      updateLocal(productId, quantity, size, color);
    }
  }
  async function remove(productId, size = null, color = null) {
    const token = API.auth.getToken();
    if (token) {
      try {
        return await API.cart.remove(productId, size, color);
      } catch (error) {
        console.error('Error removing from bag:', error);
        removeLocal(productId, size, color);
      }
    } else {
      removeLocal(productId, size, color);
    }
  }
  function total(items) {
    return items.reduce((sum, i) => {
      const p = i.Product || i.product;
      const price = Number(i.price || p.price);
      return sum + price * i.quantity;
    }, 0);
  }
  return { getLocal, addLocal, updateLocal, removeLocal, mergeLocalToServer, list, add, update, remove, total };
})();
