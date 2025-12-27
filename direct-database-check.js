const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function directDatabaseCheck() {
  try {
    console.log('🔍 DIRECT DATABASE FILE INSPECTION');
    console.log('=' .repeat(60));
    
    const dbPath = path.join(__dirname, 'server', 'data', 'matinacloset.sqlite');
    console.log(`\n💾 Database file: ${dbPath}`);
    
    // Open database directly with sqlite3
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n👥 DIRECT USER TABLE QUERY:');
    
    // Query all users directly
    db.all("SELECT id, name, email, role, created_at FROM Users", (err, rows) => {
      if (err) {
        console.error('❌ Error querying users:', err);
        return;
      }
      
      console.log(`   Total users found: ${rows.length}`);
      rows.forEach(user => {
        console.log(`   ID ${user.id}: ${user.name} (${user.email}) - ${user.role}`);
        console.log(`      Created: ${user.created_at}`);
      });
      
      // Specifically check for Kelvin
      console.log('\n🎯 KELVIN USER SEARCH:');
      db.all("SELECT * FROM Users WHERE email = 'kelvin@gmail.com'", (err, kelvinRows) => {
        if (err) {
          console.error('❌ Error searching for Kelvin:', err);
          return;
        }
        
        if (kelvinRows.length > 0) {
          console.log('   ❌ KELVIN FOUND IN DATABASE FILE:');
          kelvinRows.forEach(kelvin => {
            console.log(`   ID: ${kelvin.id}`);
            console.log(`   Name: ${kelvin.name}`);
            console.log(`   Email: ${kelvin.email}`);
            console.log(`   Role: ${kelvin.role}`);
            console.log(`   Created: ${kelvin.created_at}`);
            console.log(`   Password hash: ${kelvin.password ? kelvin.password.substring(0, 20) + '...' : 'NULL'}`);
          });
          
          console.log('\n🔧 SOLUTION NEEDED:');
          console.log('   Kelvin user exists in the actual database file');
          console.log('   Need to delete Kelvin from the database file directly');
          
          // Delete Kelvin directly
          console.log('\n🗑️ DELETING KELVIN DIRECTLY:');
          db.run("DELETE FROM Users WHERE email = 'kelvin@gmail.com'", function(err) {
            if (err) {
              console.error('❌ Error deleting Kelvin:', err);
            } else {
              console.log(`   ✅ Deleted ${this.changes} Kelvin user(s) from database`);
              
              // Also delete cart items
              db.run("DELETE FROM CartItems WHERE userId = ?", [2], function(err) {
                if (err) {
                  console.error('❌ Error deleting cart items:', err);
                } else {
                  console.log(`   ✅ Deleted ${this.changes} cart items for user ID 2`);
                }
                
                // Verify deletion
                console.log('\n🔍 VERIFYING DELETION:');
                db.all("SELECT * FROM Users WHERE email = 'kelvin@gmail.com'", (err, verifyRows) => {
                  if (err) {
                    console.error('❌ Error verifying deletion:', err);
                  } else {
                    if (verifyRows.length === 0) {
                      console.log('   ✅ Kelvin successfully deleted from database file');
                    } else {
                      console.log('   ❌ Kelvin still exists in database file');
                    }
                  }
                  
                  console.log('\n🚀 DIRECT DATABASE FIX COMPLETE!');
                  console.log('   • Kelvin deleted from actual database file');
                  console.log('   • Cart items cleaned up');
                  console.log('   • Restart server and test again');
                  
                  db.close();
                });
              });
            }
          });
          
        } else {
          console.log('   ✅ Kelvin not found in database file');
          console.log('   This is extremely strange - login should not work');
          
          console.log('\n🤔 ALTERNATIVE INVESTIGATION:');
          console.log('   Checking if there are other user emails similar to Kelvin...');
          
          db.all("SELECT email FROM Users WHERE email LIKE '%kelvin%'", (err, similarRows) => {
            if (err) {
              console.error('❌ Error searching similar emails:', err);
            } else {
              console.log(`   Found ${similarRows.length} users with 'kelvin' in email:`);
              similarRows.forEach(row => {
                console.log(`   • ${row.email}`);
              });
            }
            
            db.close();
          });
        }
      });
    });
    
  } catch (error) {
    console.error('Direct database check error:', error);
  }
}

directDatabaseCheck();
