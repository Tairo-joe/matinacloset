const { sequelize } = require('./server/models');

async function checkAndRemoveIndexes() {
  try {
    console.log('Checking and removing any indexes on CartItems...');
    
    // Get all indexes on CartItems table
    const indexes = await sequelize.query(`
      SELECT name, sql FROM sqlite_master 
      WHERE type = 'index' AND tbl_name = 'CartItems'
    `);
    
    console.log('Found indexes:', indexes[0]);
    
    // Remove any indexes that might be causing unique constraints
    for (const index of indexes[0]) {
      if (index.name && index.name !== 'sqlite_autoindex_CartItems_1') {
        try {
          await sequelize.query(`DROP INDEX IF EXISTS ${index.name}`);
          console.log(`Dropped index: ${index.name}`);
        } catch (error) {
          console.log(`Could not drop index ${index.name}: ${error.message}`);
        }
      }
    }
    
    // Check the table schema
    const schema = await sequelize.query(`PRAGMA table_info(CartItems)`);
    console.log('CartItems table schema:', schema[0]);
    
    console.log('Index check completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error checking indexes:', error);
    process.exit(1);
  }
}

checkAndRemoveIndexes();
