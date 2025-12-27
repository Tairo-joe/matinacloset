const { sequelize, models } = require('./server/models');

async function fixCartItemConstraint() {
  try {
    console.log('Fixing CartItem unique constraint...');
    
    // Disable foreign key constraints temporarily
    await sequelize.query('PRAGMA foreign_keys = OFF');
    console.log('Disabled foreign key constraints');
    
    // Drop only the CartItems table
    await sequelize.getQueryInterface().dropTable('CartItems');
    console.log('Dropped CartItems table');
    
    // Re-enable foreign key constraints
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('Re-enabled foreign key constraints');
    
    // Recreate CartItems table with correct schema (no unique constraints)
    await models.CartItem.sync({ force: true });
    console.log('Recreated CartItems table without unique constraints');
    
    console.log('CartItem constraint fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing CartItem constraint:', error);
    process.exit(1);
  }
}

fixCartItemConstraint();
