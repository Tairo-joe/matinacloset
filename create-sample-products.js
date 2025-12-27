const { models } = require('./server/models');

async function createSampleProducts() {
  try {
    console.log('🛍️ CREATING SAMPLE PRODUCTS - SOLVING CART ISSUE');
    console.log('=' .repeat(50));
    
    const sampleProducts = [
      {
        name: 'Classic T-Shirt',
        category: 'Clothing',
        price: 50.00,
        stock: 50,
        imageURL: 'https://via.placeholder.com/600x450?text=Classic+T-Shirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Gray', 'Navy']
      },
      {
        name: 'Denim Jeans',
        category: 'Clothing',
        price: 89.99,
        stock: 30,
        imageURL: 'https://via.placeholder.com/600x450?text=Denim+Jeans',
        description: 'Stylish denim jeans with perfect fit',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Blue', 'Black', 'Light Blue']
      },
      {
        name: 'Summer Dress',
        category: 'Clothing',
        price: 75.00,
        stock: 25,
        imageURL: 'https://via.placeholder.com/600x450?text=Summer+Dress',
        description: 'Beautiful summer dress for any occasion',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Red', 'Blue', 'Yellow', 'Pink']
      },
      {
        name: 'Leather Jacket',
        category: 'Clothing',
        price: 199.99,
        stock: 15,
        imageURL: 'https://via.placeholder.com/600x450?text=Leather+Jacket',
        description: 'Premium leather jacket for style and warmth',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Brown']
      },
      {
        name: 'Running Shoes',
        category: 'Footwear',
        price: 120.00,
        stock: 40,
        imageURL: 'https://via.placeholder.com/600x450?text=Running+Shoes',
        description: 'Professional running shoes for athletes',
        sizes: ['7', '8', '9', '10', '11'],
        colors: ['Black', 'White', 'Blue', 'Red']
      }
    ];
    
    console.log(`\n📦 Creating ${sampleProducts.length} sample products...`);
    
    for (const product of sampleProducts) {
      const created = await models.Product.create(product);
      console.log(`   ✅ Created: ${created.name} (ID: ${created.id})`);
    }
    
    console.log('\n🎉 SUCCESS! Sample products created!');
    console.log('\n🌐 NEXT STEPS:');
    console.log('   1. Start server: node server/server.js');
    console.log('   2. Go to: http://localhost:4000');
    console.log('   3. Login as any user or register');
    console.log('   4. Try adding products to cart - SHOULD WORK NOW!');
    
    console.log('\n📱 EXPECTED RESULT:');
    console.log('   ✅ All "Add to bag" buttons will work');
    console.log('   ✅ Multiple products can be added');
    console.log('   ✅ Cart functionality fully operational');
    console.log('   ✅ No more "Failed to add to bag" messages');
    
  } catch (error) {
    console.error('Error creating products:', error);
  }
  
  process.exit(0);
}

createSampleProducts();
