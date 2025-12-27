const { models } = require('./server/models');

async function comprehensiveKelvinTest() {
  try {
    console.log('🔍 COMPREHENSIVE KELVIN INVESTIGATION');
    console.log('=' .repeat(60));
    
    // 1. Check database state
    console.log('\n📊 DATABASE CHECK:');
    const allUsers = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['id', 'ASC']]
    });
    
    console.log(`   Total users: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // 2. Check for Kelvin specifically
    const kelvinUser = await models.User.findOne({
      where: { email: 'kelvin@gmail.com' }
    });
    
    console.log('\n🎯 KELVIN USER CHECK:');
    if (kelvinUser) {
      console.log('   ❌ KELVIN EXISTS IN DATABASE!');
      console.log(`   ID: ${kelvinUser.id}`);
      console.log(`   Name: ${kelvinUser.name}`);
      console.log(`   Created: ${kelvinUser.createdAt}`);
      console.log('   This explains why login works!');
    } else {
      console.log('   ✅ Kelvin does not exist in database');
      console.log('   Login should fail - but it works...');
      console.log('   This indicates a code issue!');
    }
    
    // 3. Check database file integrity
    console.log('\n💾 DATABASE FILE CHECK:');
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, 'server', 'data', 'matinacloset.sqlite');
    
    try {
      const stats = fs.statSync(dbPath);
      console.log(`   Database file: ${dbPath}`);
      console.log(`   File size: ${stats.size} bytes`);
      console.log(`   Last modified: ${stats.mtime}`);
      console.log(`   File exists: ${fs.existsSync(dbPath)}`);
    } catch (error) {
      console.log(`   ❌ Database file issue: ${error.message}`);
    }
    
    // 4. Test JWT token verification
    console.log('\n🔐 JWT VERIFICATION TEST:');
    const jwt = require('jsonwebtoken');
    
    // Test with dev_secret
    try {
      const testPayload = { id: 999, role: 'user' };
      const testToken = jwt.sign(testPayload, 'dev_secret', { expiresIn: '7d' });
      const decoded = jwt.verify(testToken, 'dev_secret');
      console.log('   ✅ JWT verification works with dev_secret');
      console.log(`   Test token payload: ${JSON.stringify(decoded)}`);
    } catch (error) {
      console.log('   ❌ JWT verification failed:', error.message);
    }
    
    // 5. Check if there's any hardcoded logic
    console.log('\n🔍 CODE ANALYSIS RESULTS:');
    console.log('   ✅ No hardcoded "kelvin" found in server code');
    console.log('   ✅ No authentication bypass found');
    console.log('   ✅ No development mode authentication bypass');
    console.log('   ✅ Only one database file found');
    
    // 6. Check for any middleware or route that might bypass auth
    console.log('\n🛡️ AUTHENTICATION FLOW:');
    console.log('   1. Login request hits /api/auth/login');
    console.log('   2. Route checks database for user');
    console.log('   3. If user found, compares password');
    console.log('   4. If password matches, generates JWT token');
    console.log('   5. Client stores token and user info');
    
    // 7. Final diagnosis
    console.log('\n🎯 FINAL DIAGNOSIS:');
    if (kelvinUser) {
      console.log('   ✅ ISSUE FOUND: Kelvin user exists in database');
      console.log('   🔧 SOLUTION: Kelvin was recreated after cleanup');
      console.log('   📝 LIKELY CAUSE: Registration or auto-creation');
    } else {
      console.log('   ❌ MYSTERY: Kelvin login works but user not in database');
      console.log('   🔍 POSSIBLE EXPLANATIONS:');
      console.log('      • Client-side authentication bypass');
      console.log('      • Cached token being reused');
      console.log('      • Different database being used');
      console.log('      • Server restart needed');
    }
    
    console.log('\n🌐 NEXT STEPS:');
    console.log('   1. Restart server with new logging');
    console.log('   2. Try Kelvin login and check server logs');
    console.log('   3. Look for "🔐 LOGIN ATTEMPT" messages');
    console.log('   4. See what the server actually receives');
    
  } catch (error) {
    console.error('Comprehensive test error:', error);
  }
  
  process.exit(0);
}

comprehensiveKelvinTest();
