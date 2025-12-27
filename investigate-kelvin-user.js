const { models } = require('./server/models');

async function investigateKelvinUser() {
  try {
    console.log('🔍 INVESTIGATING KELVIN USER - WHY STILL EXISTS?');
    console.log('=' .repeat(60));
    
    // Check all users in database
    const allUsers = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📋 ALL USERS IN DATABASE RIGHT NOW:');
    allUsers.forEach(user => {
      console.log(`   ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
      console.log(`      Created: ${user.createdAt}`);
    });
    
    // Specifically check for kelvin@gmail.com
    const kelvinUser = await models.User.findOne({
      where: { email: 'kelvin@gmail.com' }
    });
    
    if (kelvinUser) {
      console.log('\n❌ KELVIN USER STILL EXISTS:');
      console.log(`   ID: ${kelvinUser.id}`);
      console.log(`   Name: ${kelvinUser.name}`);
      console.log(`   Email: ${kelvinUser.email}`);
      console.log(`   Role: ${kelvinUser.role}`);
      console.log(`   Created: ${kelvinUser.createdAt}`);
      
      console.log('\n🤔 POSSIBLE REASONS:');
      console.log('   1. Cleanup script didn\'t run properly');
      console.log('   2. User was recreated after cleanup');
      console.log('   3. There are multiple database files');
      console.log('   4. Authentication is using a different database');
      
      // Check if kelvin has cart items
      const kelvinCartItems = await models.CartItem.findAll({
        where: { userId: kelvinUser.id }
      });
      
      console.log(`\n🛒 KELVIN CART ITEMS: ${kelvinCartItems.length}`);
      kelvinCartItems.forEach(item => {
        console.log(`   • Product ID: ${item.productId}, Quantity: ${item.quantity}`);
      });
      
      // Test password verification
      console.log('\n🔐 TESTING PASSWORD VERIFICATION:');
      console.log('   Stored password hash:', kelvinUser.password);
      console.log('   You mentioned password: 12345678');
      
    } else {
      console.log('\n✅ KELVIN USER DOES NOT EXIST IN DATABASE');
      console.log('   If you can still login, there might be:');
      console.log('   1. Session/token cache');
      console.log('   2. Different database file');
      console.log('   3. Authentication bypass');
    }
    
    // Check database file info
    console.log('\n💾 DATABASE INFORMATION:');
    console.log('   Database file: matinacloset.sqlite');
    console.log('   Location: ./server/data/matinacloset.sqlite');
    
    // Try to delete kelvin user again if it exists
    if (kelvinUser) {
      console.log('\n🗑️ ATTEMPTING TO DELETE KELVIN USER AGAIN:');
      try {
        // Delete cart items first
        await models.CartItem.destroy({ where: { userId: kelvinUser.id } });
        console.log('   ✅ Deleted Kelvin cart items');
        
        // Delete user
        await models.User.destroy({ where: { id: kelvinUser.id } });
        console.log('   ✅ Deleted Kelvin user');
        
        // Verify deletion
        const verifyUser = await models.User.findOne({
          where: { email: 'kelvin@gmail.com' }
        });
        
        if (verifyUser) {
          console.log('   ❌ USER STILL EXISTS AFTER DELETION - DATABASE ISSUE');
        } else {
          console.log('   ✅ USER SUCCESSFULLY DELETED');
        }
        
      } catch (deleteError) {
        console.error('   ❌ Error deleting Kelvin user:', deleteError.message);
      }
    }
    
  } catch (error) {
    console.error('Investigation error:', error);
  }
  
  process.exit(0);
}

investigateKelvinUser();
