const { sequelize, models } = require('./server/models');

async function fixCartTable() {
  try {
    console.log('Fixing CartItem table...');
    
    // Drop the existing CartItem table to remove the problematic constraint
    await sequelize.getQueryInterface().dropTable('CartItems');
    console.log('Dropped old CartItems table');
    
    // Recreate the table with the new schema (no unique constraint)
    await models.CartItem.sync({ force: true });
    console.log('Recreated CartItems table with new schema');
    
    console.log('Cart table fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing cart table:', error);
    process.exit(1);
  }
}

fixCartTable();
