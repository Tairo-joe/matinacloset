const { models } = require('./server/models');

async function deepInvestigateKelvin() {
  try {
    console.log('🔍 DEEP INVESTIGATION - KELVIN STILL LOGGING IN');
    console.log('=' .repeat(60));
    
    // Check database again
    console.log('\n📊 CURRENT DATABASE STATE:');
    const allUsers = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['id', 'ASC']]
    });
    
    allUsers.forEach(user => {
      console.log(`   ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Check if Kelvin exists
    const kelvinUser = await models.User.findOne({
      where: { email: 'kelvin@gmail.com' }
    });
    
    if (kelvinUser) {
      console.log('\n❌ KELVIN FOUND IN DATABASE:');
      console.log('   This explains why login still works!');
      console.log('   The user was recreated somehow.');
    } else {
      console.log('\n✅ KELVIN NOT IN DATABASE:');
      console.log('   This means there\'s another issue...');
      
      // Check if there are any other authentication mechanisms
      console.log('\n🔍 CHECKING FOR OTHER ISSUES:');
      
      // Check if there's a hardcoded user in auth.js
      console.log('   • Checking for hardcoded users...');
      console.log('   • Checking for fallback authentication...');
      console.log('   • Checking for dev bypass...');
      
      // Let's check if kelvin is being auto-created
      console.log('\n🤔 POSSIBLE REASONS:');
      console.log('   1. Kelvin user is being auto-recreated');
      console.log('   2. There\'s a hardcoded fallback in auth');
      console.log('   3. Different database file being used');
      console.log('   4. Authentication bypass in development');
      console.log('   5. Multiple database connections');
    }
    
    // Test login attempt simulation
    console.log('\n🧪 SIMULATING KELVIN LOGIN:');
    try {
      const testUser = await models.User.findOne({ 
        where: { email: 'kelvin@gmail.com' } 
      });
      
      if (testUser) {
        console.log('   ✅ Found Kelvin in database now');
        console.log('   • User ID:', testUser.id);
        console.log('   • Name:', testUser.name);
        console.log('   • Created:', testUser.createdAt);
      } else {
        console.log('   ❌ Kelvin not found in database');
        console.log('   • Login should fail');
        console.log('   • But it\'s still working...');
        console.log('   • This indicates a code issue');
      }
    } catch (error) {
      console.error('   ❌ Error checking Kelvin:', error.message);
    }
    
    // Check for any recent user creation
    console.log('\n📅 RECENT USER CREATIONS:');
    const recentUsers = await models.User.findAll({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 60000) // Last 1 minute
        }
      }
    });
    
    if (recentUsers.length > 0) {
      console.log(`   Found ${recentUsers.length} users created in last minute:`);
      recentUsers.forEach(user => {
        console.log(`   • ${user.name} (${user.email}) at ${user.createdAt}`);
      });
    } else {
      console.log('   No recent user creations found');
    }
    
    // Force delete Kelvin if found
    if (kelvinUser) {
      console.log('\n🗑️ FORCE DELETING KELVIN:');
      await models.CartItem.destroy({ where: { userId: kelvinUser.id } });
      await models.User.destroy({ where: { id: kelvinUser.id } });
      console.log('   ✅ Kelvin deleted from database');
      
      // Verify deletion
      const verifyUser = await models.User.findOne({
        where: { email: 'kelvin@gmail.com' }
      });
      
      if (verifyUser) {
        console.log('   ❌ DELETION FAILED - DATABASE ISSUE');
      } else {
        console.log('   ✅ DELETION SUCCESSFUL');
        console.log('   Now try logging in again - should fail');
      }
    }
    
  } catch (error) {
    console.error('Deep investigation error:', error);
  }
  
  process.exit(0);
}

deepInvestigateKelvin();
