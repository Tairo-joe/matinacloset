const { models } = require('./server/models');

async function debugCurrentProducts() {
  try {
    console.log('🔍 DEBUGGING CURRENT PRODUCTS AND CART');
    console.log('=' .repeat(50));
    
    // Check all products in database
    const products = await models.Product.findAll({
      attributes: ['id', 'name', 'price', 'category', 'stock', 'imageURL'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📦 CURRENT PRODUCTS IN DATABASE:');
    if (products.length === 0) {
      console.log('❌ No products found in database!');
    } else {
      products.forEach(product => {
        console.log(`   ✅ ID: ${product.id} - ${product.name}`);
        console.log(`      Price: ${product.price}, Stock: ${product.stock}`);
        console.log(`      Category: ${product.category}`);
        console.log(`      Image: ${product.imageURL || 'No image'}`);
        console.log('');
      });
    }
    
    // Test cart functionality with existing products
    console.log('🧪 TESTING CART ADD FOR EACH PRODUCT:');
    
    for (const product of products) {
      try {
        // Clear existing cart for user 2
        await models.CartItem.destroy({ where: { userId: 2 } });
        
        console.log(`\n   Testing product ID: ${product.id} (${product.name})`);
        
        // Try to add product to cart
        const newCartItem = await models.CartItem.create({
          userId: 2,
          productId: product.id,
          quantity: 1
        });
        
        console.log(`   ✅ SUCCESS: Added to cart (CartItem ID: ${newCartItem.id})`);
        
        // Clean up for next test
        await models.CartItem.destroy({ where: { id: newCartItem.id } });
        
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
      }
    }
    
    console.log('\n🎯 ANALYSIS:');
    if (products.length === 0) {
      console.log('   • No products exist - create products first');
    } else {
      console.log('   • Products exist - check if cart errors are specific to certain products');
      console.log('   • If some succeed and others fail, check product data integrity');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugCurrentProducts();
