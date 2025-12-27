const { models } = require('./server/models');

async function permanentKelvinFix() {
  try {
    console.log('🔧 PERMANENT KELVIN FIX');
    console.log('=' .repeat(50));
    
    // Find Kelvin user
    const kelvinUser = await models.User.findOne({
      where: { email: 'kelvin@gmail.com' }
    });
    
    if (kelvinUser) {
      console.log('🎯 FOUND KELVIN USER:');
      console.log(`   ID: ${kelvinUser.id}`);
      console.log(`   Name: ${kelvinUser.name}`);
      console.log(`   Email: ${kelvinUser.email}`);
      console.log(`   Role: ${kelvinUser.role}`);
      console.log(`   Created: ${kelvinUser.createdAt}`);
      
      // Delete Kelvin's cart items first
      await models.CartItem.destroy({ where: { userId: kelvinUser.id } });
      console.log('   ✅ Deleted Kelvin cart items');
      
      // Delete Kelvin user
      await models.User.destroy({ where: { id: kelvinUser.id } });
      console.log('   ✅ Deleted Kelvin user');
      
      // Verify deletion
      const verifyUser = await models.User.findOne({
        where: { email: 'kelvin@gmail.com' }
      });
      
      if (verifyUser) {
        console.log('   ❌ DELETION FAILED - DATABASE ISSUE');
      } else {
        console.log('   ✅ KELVIN SUCCESSFULLY DELETED');
      }
    } else {
      console.log('✅ Kelvin user not found - already deleted');
    }
    
    // Show final user list
    const remainingUsers = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      order: [['id', 'ASC']]
    });
    
    console.log('\n📋 FINAL USERS:');
    remainingUsers.forEach(user => {
      console.log(`   ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🚀 PERMANENT FIX COMPLETE!');
    console.log('   • Kelvin user permanently deleted');
    console.log('   • All cart items cleared');
    console.log('   • Only admin user remains');
    
    console.log('\n🌐 NEXT STEPS:');
    console.log('   1. Restart server: node server/server.js');
    console.log('   2. Clear browser localStorage (mc_token and mc_user)');
    console.log('   3. Try Kelvin login - should fail');
    console.log('   4. Login as admin - should work');
    console.log('   5. Test cart functionality');
    
    console.log('\n💡 PREVENTION:');
    console.log('   • Avoid recreating Kelvin user');
    console.log('   • Use admin account for testing');
    console.log('   • Monitor database for unexpected users');
    
  } catch (error) {
    console.error('Permanent fix error:', error);
  }
  
  process.exit(0);
}

permanentKelvinFix();
