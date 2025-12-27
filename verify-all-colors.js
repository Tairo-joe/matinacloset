const API = (() => {
  const BASE = 'http://localhost:4000/api';
  
  async function request(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    if (!res.ok) {
      let err = 'Request failed';
      try { const data = await res.json(); err = data.error || data.message || err; } catch (_) {}
      throw new Error(err);
    }
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return text; }
  }

  const products = {
    async list() { 
      return request('/products'); 
    },
  };

  return { products };
})();

async function verifyAllColorSwatches() {
  try {
    console.log('🔍 Verifying all products have proper color swatch display...');
    
    const products = await API.products.list();
    console.log(`📦 Found ${products.length} products in database`);
    
    let productsWithColors = 0;
    let productsWithoutColors = 0;
    let issues = [];
    
    products.forEach(p => {
      console.log(`\n🎨 Product ${p.id}: ${p.name}`);
      console.log(`   Colors type: ${typeof p.colors}`);
      console.log(`   Colors value: ${JSON.stringify(p.colors)}`);
      
      if (p.colors) {
        let colorArray = [];
        if (typeof p.colors === 'string') {
          colorArray = p.colors.split(',').map(c => c.trim()).filter(c => c);
        } else if (Array.isArray(p.colors)) {
          colorArray = p.colors;
        }
        
        if (colorArray.length > 0) {
          productsWithColors++;
          console.log(`   ✅ Has ${colorArray.length} colors: ${colorArray.join(', ')}`);
        } else {
          productsWithoutColors++;
          console.log(`   ⚠️ Empty colors array`);
          issues.push(`Product ${p.id} (${p.name}) has empty colors`);
        }
      } else {
        productsWithoutColors++;
        console.log(`   ⚠️ No colors defined`);
        issues.push(`Product ${p.id} (${p.name}) has no colors`);
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Products with colors: ${productsWithColors}`);
    console.log(`   Products without colors: ${productsWithoutColors}`);
    
    if (issues.length > 0) {
      console.log(`\n⚠️ Issues found:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log(`\n🎉 All products have proper color data!`);
    }
    
    console.log(`\n🌐 Test these products in your browser:`);
    products.slice(0, 3).forEach(p => {
      console.log(`   http://localhost:4000/product.html?id=${p.id}`);
    });
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
  }
}

verifyAllColorSwatches();
