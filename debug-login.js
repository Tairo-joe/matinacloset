const bcrypt = require('bcryptjs');
const { sequelize, models } = require('./server/models');

async function debugLogin() {
  try {
    console.log('=== DEBUG LOGIN PROCESS ===');
    
    // 1. Check admin user in database
    const admin = await models.User.findOne({ where: { email: 'admin@matinacloset.com' } });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', { id: admin.id, email: admin.email, role: admin.role });
    console.log('📝 Password hash:', admin.password);
    
    // 2. Test password comparison
    const testPassword = 'Admin123!';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('🔐 Password comparison result:', isValid);
    
    // 3. Simulate the exact login process
    const user = await models.User.findOne({ where: { email: 'admin@matinacloset.com' } });
    if (!user) {
      console.log('❌ User not found in login simulation');
      return;
    }
    
    const passwordMatch = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 Login simulation password match:', passwordMatch);
    
    if (passwordMatch) {
      console.log('✅ Login should succeed');
    } else {
      console.log('❌ Login should fail - password mismatch');
      
      // Test different passwords
      const tests = ['admin', 'Admin123', 'admin123', 'Admin123!', 'password'];
      for (const pwd of tests) {
        const match = await bcrypt.compare(pwd, user.password);
        console.log(`   Testing "${pwd}": ${match}`);
      }
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();
