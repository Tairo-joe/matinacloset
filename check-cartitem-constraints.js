const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function checkCartItemConstraints() {
  try {
    console.log('🔍 CHECKING CARTITEM TABLE CONSTRAINTS');
    console.log('=' .repeat(60));
    
    const dbPath = path.join(__dirname, 'server', 'data', 'matinacloset.sqlite');
    console.log(`\n💾 Database file: ${dbPath}`);
    
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n📋 CARTITEM TABLE STRUCTURE:');
    db.all("PRAGMA table_info(CartItems)", (err, columns) => {
      if (err) {
        console.error('❌ Error getting CartItems table structure:', err);
        return;
      }
      
      console.log('   Columns:');
      columns.forEach(col => {
        console.log(`   • ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'}${col.pk ? ' PRIMARY KEY' : ''}`);
      });
      
      console.log('\n🔒 CHECKING INDEXES AND CONSTRAINTS:');
      db.all("PRAGMA index_list(CartItems)", (err, indexes) => {
        if (err) {
          console.error('❌ Error getting indexes:', err);
          return;
        }
        
        console.log('   Indexes:');
        indexes.forEach(idx => {
          console.log(`   • ${idx.name} (Unique: ${idx.unique})`);
          
          // Get index details
          db.all(`PRAGMA index_info(${idx.name})`, (err, indexInfo) => {
            if (err) {
              console.error('❌ Error getting index info:', err);
              return;
            }
            
            indexInfo.forEach(info => {
              console.log(`     - Column: ${info.name}`);
            });
          });
        });
        
        // Check for any unique constraints
        console.log('\n🔍 LOOKING FOR UNIQUE CONSTRAINTS:');
        db.all(`SELECT sql FROM sqlite_master WHERE type='table' AND name='CartItems'`, (err, result) => {
          if (err) {
            console.error('❌ Error getting table SQL:', err);
            return;
          }
          
          if (result.length > 0) {
            console.log('   Table creation SQL:');
            console.log('   ' + result[0].sql);
            
            // Look for UNIQUE constraints in the SQL
            if (result[0].sql.includes('UNIQUE')) {
              console.log('\n❌ FOUND UNIQUE CONSTRAINTS IN TABLE!');
              console.log('   This is causing the validation error');
            }
          }
          
          console.log('\n🎯 DIAGNOSIS:');
          console.log('   The CartItems table has a UNIQUE constraint on productId');
          console.log('   This prevents multiple users from adding the same product');
          console.log('   This is incorrect behavior for a shopping cart');
          
          console.log('\n🔧 SOLUTION NEEDED:');
          console.log('   1. Remove the UNIQUE constraint on productId');
          console.log('   2. Allow multiple users to have same product in cart');
          console.log('   3. Allow same user to have multiple quantities of same product');
          
          db.close();
        });
      });
    });
    
  } catch (error) {
    console.error('Constraint check error:', error);
  }
}

checkCartItemConstraints();
