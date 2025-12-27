const { sequelize, models } = require('./server/models');

async function checkColorData() {
  try {
    const products = await models.Product.findAll({
      attributes: ['id', 'name', 'colors'],
      limit: 5
    });
    
    console.log('🔍 Checking color data format in database:');
    products.forEach(p => {
      console.log(`Product ${p.id}: ${p.name}`);
      console.log(`   Colors type: ${typeof p.colors}`);
      console.log(`   Colors value: ${JSON.stringify(p.colors)}`);
      console.log(`   Is array: ${Array.isArray(p.colors)}`);
      console.log('---');
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColorData();
