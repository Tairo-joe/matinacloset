const bcrypt = require('bcryptjs');
const { sequelize, models } = require('./server/models');

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const adminEmail = 'admin@matinacloset.com';
    const adminPassword = 'Admin123!';

    // Check if admin already exists
    let admin = await models.User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      console.log('Creating admin user...');
      const hash = await bcrypt.hash(adminPassword, 10);
      admin = await models.User.create({ 
        name: 'Admin', 
        email: adminEmail, 
        password: hash, 
        role: 'admin' 
      });
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if there are any products
    const productCount = await models.Product.count();
    console.log(`📦 Products in database: ${productCount}`);

    if (productCount === 0) {
      console.log('Creating sample products...');
      const products = [
        { name: 'Matina Tee Classic', category: 'Clothing', price: 24.99, imageURL: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop', description: 'Soft cotton t-shirt with a relaxed fit.', stock: 50, gender: 'women' },
        { name: 'Matina Hoodie', category: 'Clothing', price: 49.99, imageURL: 'https://images.unsplash.com/photo-1548883354-94bcfe321c0f?q=80&w=800&auto=format&fit=crop', description: 'Cozy fleece hoodie for everyday wear.', stock: 35, gender: 'men' },
        { name: 'Girls T-Shirt', category: 'T-shirts & Graphics', price: 19.99, imageURL: 'https://www1.assets-gap.com/webcontent/0060/428/687/cn60428687.jpg?q=h&w=520', description: 'Fun and stylish girls t-shirt', stock: 30, gender: 'girls' },
        { name: 'Girls Dress', category: 'Dresses', price: 34.99, imageURL: 'https://www1.assets-gap.com/webcontent/0059/893/206/cn59893206.jpg?q=h&w=520', description: 'Beautiful girls dress', stock: 25, gender: 'girls' },
        { name: 'Girls Jeans', category: 'Jeans', price: 39.99, imageURL: 'https://www1.assets-gap.com/webcontent/0060/461/128/cn60461128.jpg?q=h&w=520', description: 'Stylish girls jeans', stock: 20, gender: 'girls' },
      ];

      for (const p of products) {
        await models.Product.create(p);
        console.log(`✅ Created product: ${p.name}`);
      }
    }

    // Check user count
    const userCount = await models.User.count();
    console.log(`👥 Users in database: ${userCount}`);

    await sequelize.close();
    console.log('✅ Setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
