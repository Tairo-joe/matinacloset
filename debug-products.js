const { models } = require('./server/models');

async function debugProducts() {
  try {
    console.log('🔍 DEBUGGING PRODUCTS AND CART ISSUES');
    console.log('=' .repeat(50));
    
    // Check all products in database
    const products = await models.Product.findAll({
      attributes: ['id', 'name', 'price'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📦 PRODUCTS IN DATABASE:');
    if (products.length === 0) {
      console.log('❌ No products found in database!');
      console.log('   You need to add products through the admin panel first.');
    } else {
      products.forEach(product => {
        console.log(`   ✅ ID: ${product.id} - ${product.name} - ${product.price}`);
      });
    }
    
    // Check cart items
    const cartItems = await models.CartItem.findAll({
      include: [{ model: models.Product, attributes: ['id', 'name'] }],
      order: [['id', 'ASC']]
    });
    
    console.log('\n🛒 CURRENT CART ITEMS:');
    if (cartItems.length === 0) {
      console.log('   📭 No cart items found');
    } else {
      cartItems.forEach(item => {
        console.log(`   ✅ User: ${item.userId}, Product: ${item.productId} (${item.Product?.name || 'Unknown'}), Qty: ${item.quantity}`);
      });
    }
    
    // Test adding a product that exists
    if (products.length > 0) {
      const testProduct = products[0];
      console.log('\n🧪 TESTING CART ADD:');
      console.log(`   Testing with product ID: ${testProduct.id} (${testProduct.name})`);
      
      try {
        // Clear existing cart for user 2
        await models.CartItem.destroy({ where: { userId: 2 } });
        
        // Add test product
        const newCartItem = await models.CartItem.create({
          userId: 2,
          productId: testProduct.id,
          quantity: 1
        });
        
        console.log(`   ✅ Successfully added to cart: CartItem ID ${newCartItem.id}`);
        
        // Verify it was added
        const verifyItem = await models.CartItem.findOne({
          where: { id: newCartItem.id },
          include: [{ model: models.Product }]
        });
        
        console.log(`   ✅ Verification: ${verifyItem.Product.name} in cart for user ${verifyItem.userId}`);
        
      } catch (error) {
        console.log(`   ❌ Failed to add to cart: ${error.message}`);
      }
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (products.length === 0) {
      console.log('   1. Login as admin: admin@matinacloset.com / Admin123!');
      console.log('   2. Go to admin panel');
      console.log('   3. Add some products');
      console.log('   4. Try cart functionality again');
    } else {
      console.log('   1. Products exist - check frontend is sending correct product IDs');
      console.log('   2. Check browser console for specific error messages');
      console.log('   3. Verify user is logged in properly');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugProducts();
