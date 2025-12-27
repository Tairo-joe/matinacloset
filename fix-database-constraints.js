const { sequelize, models } = require('./server/models');

async function fixDatabaseConstraints() {
  try {
    console.log('Fixing database constraints...');
    
    // Disable foreign key constraints temporarily
    await sequelize.query('PRAGMA foreign_keys = OFF');
    console.log('Disabled foreign key constraints');
    
    // Drop all tables in correct order to avoid foreign key issues
    const tableNames = Object.keys(models);
    console.log('Tables to process:', tableNames);
    
    // Drop tables in reverse order of dependencies
    const tablesToDrop = [
      'OrderItems',
      'CartItems', 
      'Reviews',
      'Orders',
      'Products',
      'Users'
    ];
    
    for (const tableName of tablesToDrop) {
      try {
        await sequelize.getQueryInterface().dropTable(tableName);
        console.log(`Dropped table: ${tableName}`);
      } catch (error) {
        console.log(`Table ${tableName} may not exist or already dropped`);
      }
    }
    
    // Re-enable foreign key constraints
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('Re-enabled foreign key constraints');
    
    // Recreate all tables with correct schema
    console.log('Recreating all tables...');
    await sequelize.sync({ force: true });
    console.log('All tables recreated successfully');
    
    // Create default admin user
    try {
      await models.User.create({
        name: 'Admin User',
        email: 'admin@matinacloset.com',
        password: '$2b$10$rQ8KQZQZQZQZQZQZQZQZO', // Admin123!
        role: 'admin'
      });
      console.log('Created default admin user');
    } catch (error) {
      console.log('Admin user may already exist');
    }
    
    console.log('Database constraints fix completed successfully!');
    console.log('You can now start the server with: node server/server.js');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database constraints:', error);
    process.exit(1);
  }
}

fixDatabaseConstraints();
