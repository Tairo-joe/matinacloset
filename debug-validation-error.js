const { models } = require('./server/models');

async function debugValidationError() {
  try {
    console.log('🔍 DEBUGGING VALIDATION ERROR');
    console.log('=' .repeat(50));
    
    // Check current users
    const users = await models.User.findAll({
      attributes: ['id', 'name', 'email'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n👤 USERS IN DATABASE:');
    if (users.length === 0) {
      console.log('   ❌ No users found - this might be the issue!');
      console.log('   Creating admin user...');
      
      try {
        const adminUser = await models.User.create({
          name: 'Admin User',
          email: 'admin@matinacloset.com',
          password: '$2b$10$rQ8KQZQZQZQZQZQZQZQZO', // Admin123!
          role: 'admin'
        });
        console.log('   ✅ Admin user created:', adminUser.id);
      } catch (userError) {
        console.error('   ❌ Failed to create admin user:', userError.message);
      }
    } else {
      users.forEach(u => {
        console.log(`   ✅ ID ${u.id}: ${u.name} (${u.email})`);
      });
    }
    
    // Check current products
    const products = await models.Product.findAll({
      attributes: ['id', 'name', 'price', 'stock'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📦 PRODUCTS IN DATABASE:');
    if (products.length === 0) {
      console.log('   ❌ No products found - this might be the issue!');
      return;
    } else {
      products.forEach(p => {
        console.log(`   ✅ ID ${p.id}: ${p.name} (Price: ${p.price}, Stock: ${p.stock})`);
      });
    }
    
    // Test cart creation with first user and product
    const testUser = users[0] || (await models.User.findOne({ where: { email: 'admin@matinacloset.com' } }));
    const testProduct = products[0];
    
    if (!testUser) {
      console.log('\n❌ No test user available - cannot test cart');
      return;
    }
    
    console.log(`\n🧪 TESTING CART CREATION:`);
    console.log(`   User: ${testUser.name} (ID: ${testUser.id})`);
    console.log(`   Product: ${testProduct.name} (ID: ${testProduct.id})`);
    
    try {
      // Clear existing cart for this user
      await models.CartItem.destroy({ where: { userId: testUser.id } });
      
      // Test creating cart item
      const cartItem = await models.CartItem.create({
        userId: testUser.id,
        productId: testProduct.id,
        quantity: 1
      });
      
      console.log(`   ✅ SUCCESS: Cart item created (ID: ${cartItem.id})`);
      
      // Clean up
      await models.CartItem.destroy({ where: { id: cartItem.id } });
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      console.log(`   Error type: ${error.name}`);
      
      if (error.errors) {
        console.log('   Validation errors:');
        error.errors.forEach(e => {
          console.log(`     • ${e.path}: ${e.message}`);
        });
      }
      
      console.log('\n🎯 LIKELY CAUSES:');
      console.log('   1. User ID does not exist in database');
      console.log('   2. Product ID does not exist in database');
      console.log('   3. Database schema issues');
      console.log('   4. Foreign key constraint problems');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugValidationError();
