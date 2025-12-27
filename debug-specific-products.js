const { models } = require('./server/models');

async function debugSpecificProducts() {
  try {
    console.log('🔍 DEBUGGING SPECIFIC PRODUCTS - WHY SOME WORK, OTHERS DONT');
    console.log('=' .repeat(60));
    
    // Get all products
    const products = await models.Product.findAll({
      attributes: ['id', 'name', 'price', 'stock', 'imageURL'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📦 ALL PRODUCTS IN DATABASE:');
    products.forEach(p => {
      console.log(`   ✅ ID ${p.id}: ${p.name}`);
      console.log(`      Price: ${p.price}, Stock: ${p.stock}`);
      console.log(`      Image: ${p.imageURL}`);
      console.log('');
    });
    
    // Test each product individually
    console.log('🧪 TESTING EACH PRODUCT FOR CART ADD:');
    
    const testUserId = 2; // Test user
    
    for (const product of products) {
      console.log(`\n   Testing Product ID ${product.id}: ${product.name}`);
      
      try {
        // Clear cart for this test
        await models.CartItem.destroy({ where: { userId: testUserId } });
        
        // Test adding to cart (simulate API call)
        const cartItem = await models.CartItem.create({
          userId: testUserId,
          productId: product.id,
          quantity: 1
        });
        
        console.log(`   ✅ SUCCESS: Added to cart (CartItem ID: ${cartItem.id})`);
        
        // Clean up
        await models.CartItem.destroy({ where: { id: cartItem.id } });
        
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        
        // Check if it's a specific type of error
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`      → This is a database constraint issue`);
        } else if (error.message.includes('foreign key')) {
          console.log(`      → This is a foreign key issue`);
        } else {
          console.log(`      → Other database error`);
        }
      }
    }
    
    // Check if there are any cart items currently
    console.log('\n🛒 CURRENT CART ITEMS:');
    const currentCart = await models.CartItem.findAll({
      include: [{ model: models.Product, attributes: ['id', 'name'] }],
      order: [['id', 'ASC']]
    });
    
    if (currentCart.length === 0) {
      console.log('   📭 No cart items found');
    } else {
      currentCart.forEach(item => {
        console.log(`   ✅ User ${item.userId}: Product ${item.productId} (${item.Product?.name || 'Unknown'})`);
      });
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('   If some products work and others dont:');
    console.log('   1. Check product data integrity (missing fields?)');
    console.log('   2. Check if frontend is sending correct product IDs');
    console.log('   3. Check browser console for specific errors');
    console.log('   4. Check network tab for failed API calls');
    
    console.log('\n🔧 BROWSER DEBUGGING STEPS:');
    console.log('   1. Open Developer Tools (F12)');
    console.log('   2. Go to Network tab');
    console.log('   3. Click "Add to bag" on working product');
    console.log('   4. Click "Add to bag" on failing product');
    console.log('   5. Compare the API calls - look for differences');
    console.log('   6. Check Console tab for JavaScript errors');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugSpecificProducts();
