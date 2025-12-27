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

// Updated getColorHex function matching the one in index.html
function getColorHex(colorName) {
  const colors = {
    'red': '#FF0000', 'Red': '#FF0000', 'RED': '#FF0000',
    'blue': '#0000FF', 'Blue': '#0000FF', 'BLUE': '#0000FF',
    'green': '#008000', 'Green': '#008000', 'GREEN': '#008000',
    'black': '#000000', 'Black': '#000000', 'BLACK': '#000000',
    'white': '#FFFFFF', 'White': '#FFFFFF', 'WHITE': '#FFFFFF',
    'yellow': '#FFFF00', 'Yellow': '#FFFF00', 'YELLOW': '#FFFF00',
    'orange': '#FFA500', 'Orange': '#FFA500', 'ORANGE': '#FFA500',
    'purple': '#800080', 'Purple': '#800080', 'PURPLE': '#800080',
    'pink': '#FFC0CB', 'Pink': '#FFC0CB', 'PINK': '#FFC0CB',
    'brown': '#A52A2A', 'Brown': '#A52A2A', 'BROWN': '#A52A2A',
    'gray': '#808080', 'Gray': '#808080', 'GRAY': '#808080',
    'grey': '#808080', 'Grey': '#808080', 'GREY': '#808080',
    'navy': '#000080', 'Navy': '#000080', 'NAVY': '#000080',
    'beige': '#F5F5DC', 'Beige': '#F5F5DC', 'BEIGE': '#F5F5DC',
    'tan': '#D2B48C', 'Tan': '#D2B48C', 'TAN': '#D2B48C'
  };
  return colors[colorName] || '#CCCCCC';
}

function generateShopColorSwatches(colors) {
  let colorsHtml = '';
  if (colors) {
    let colorArray = [];
    if (typeof colors === 'string') {
      colorArray = colors.split(',').map(c => c.trim()).filter(c => c);
    } else if (Array.isArray(colors)) {
      colorArray = colors;
    }
    
    if (colorArray.length > 0) {
      colorsHtml = colorArray.map(color => `<span class="color-swatch" style="background-color: ${getColorHex(color)};" title="${color}"></span>`).join('');
    }
  }
  return colorsHtml;
}

async function finalShopVerification() {
  try {
    console.log('🎯 FINAL VERIFICATION: Shop Dashboard Color Swatches');
    console.log('=' .repeat(60));
    
    const products = await API.products.list();
    console.log(`📦 Total products in shop: ${products.length}`);
    
    let totalSwatches = 0;
    let productsWithSwatches = 0;
    
    console.log('\n🎨 Color Swatch Analysis:');
    products.forEach((p, index) => {
      const swatches = generateShopColorSwatches(p.colors);
      const swatchCount = (swatches.match(/color-swatch/g) || []).length;
      
      totalSwatches += swatchCount;
      if (swatchCount > 0) productsWithSwatches++;
      
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   Colors: ${JSON.stringify(p.colors)}`);
      console.log(`   Swatches: ${swatchCount > 0 ? '✅' : '❌'} (${swatchCount} swatches)`);
      console.log(`   Preview: ${swatches}`);
      console.log('');
    });
    
    console.log('📊 SUMMARY:');
    console.log(`   Products with color swatches: ${productsWithSwatches}/${products.length} (${Math.round(productsWithSwatches/products.length*100)}%)`);
    console.log(`   Total color swatches displayed: ${totalSwatches}`);
    
    if (productsWithSwatches === products.length) {
      console.log('\n🎉 SUCCESS: All products will show color swatches on shop dashboard!');
    } else {
      console.log(`\n⚠️  WARNING: ${products.length - productsWithSwatches} products won't show color swatches`);
    }
    
    console.log('\n🌐 VISIT: http://localhost:4000/ to see your shop dashboard');
    console.log('💡 Every product card should display beautiful circular color swatches');
    
  } catch (error) {
    console.error('💥 Verification failed:', error.message);
  }
}

finalShopVerification();
