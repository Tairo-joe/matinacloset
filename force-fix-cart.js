const { sequelize } = require('./server/models');

async function forceFixCart() {
  try {
    console.log('Force fixing CartItems table...');
    
    // Completely disable foreign keys
    await sequelize.query('PRAGMA foreign_keys = OFF');
    console.log('Disabled foreign keys');
    
    // Drop the table completely
    try {
      await sequelize.query('DROP TABLE IF EXISTS CartItems');
      console.log('Dropped CartItems table');
    } catch (error) {
      console.log('CartItems table may not exist');
    }
    
    // Recreate table manually without any constraints
    await sequelize.query(`
      CREATE TABLE CartItems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        size TEXT,
        color TEXT
      )
    `);
    console.log('Created CartItems table without constraints');
    
    // Re-enable foreign keys
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('Re-enabled foreign keys');
    
    console.log('Force fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error in force fix:', error);
    process.exit(1);
  }
}

forceFixCart();
