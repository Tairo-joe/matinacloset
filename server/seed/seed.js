const bcrypt = require('bcryptjs');
const { sequelize, models } = require('../models');

async function run() {
  await sequelize.sync({ alter: true });
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@matinacloset.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  let admin = await models.User.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    admin = await models.User.create({ name: 'Admin', email: adminEmail, password: hash, role: 'admin' });
    console.log('Created admin user:', adminEmail);
  }

  const products = [
    { name: 'Matina Tee Classic', category: 'Clothing', price: 24.99, imageURL: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=800&auto=format&fit=crop', description: 'Soft cotton t-shirt with a relaxed fit.', stock: 50 },
    { name: 'Matina Hoodie', category: 'Clothing', price: 49.99, imageURL: 'https://images.unsplash.com/photo-1548883354-94bcfe321c0f?q=80&w=800&auto=format&fit=crop', description: 'Cozy fleece hoodie for everyday wear.', stock: 35 },
    { name: 'FreshGuard Antiperspirant', category: 'Antiperspirants', price: 12.99, imageURL: 'https://images.unsplash.com/photo-1615800002234-05f87b97381e?q=80&w=800&auto=format&fit=crop', description: '48-hour protection with a fresh scent.', stock: 100 },
    { name: 'DryShield Roll-On', category: 'Antiperspirants', price: 9.99, imageURL: 'https://images.unsplash.com/photo-1584776291073-aaa35a5d5cf7?q=80&w=800&auto=format&fit=crop', description: 'Gentle roll-on formula for sensitive skin.', stock: 120 },
    { name: 'CalmBite Gummies', category: 'Gummies', price: 19.99, imageURL: 'https://images.unsplash.com/photo-1584267385494-9fdd9fd41b83?q=80&w=800&auto=format&fit=crop', description: 'Fruit-flavored gummies for daily wellness.', stock: 80 },
    { name: 'EnergyBoost Gummies', category: 'Gummies', price: 21.99, imageURL: 'https://images.unsplash.com/photo-1615485737651-6b569faba6f8?q=80&w=800&auto=format&fit=crop', description: 'Vitamin-rich gummies for energy support.', stock: 75 },
  ];

  for (const p of products) {
    const [prod, created] = await models.Product.findOrCreate({ where: { name: p.name }, defaults: p });
    if (created) console.log('Seeded product:', prod.name);
  }

  console.log('Seeding complete');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
