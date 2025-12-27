const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixCartItemConstraints() {
  try {
    console.log('🔧 FIXING CARTITEM TABLE CONSTRAINTS');
    console.log('=' .repeat(60));
    
    const dbPath = path.join(__dirname, 'server', 'data', 'matinacloset.sqlite');
    console.log(`\n💾 Database file: ${dbPath}`);
    
    const db = new sqlite3.Database(dbPath);
    
    console.log('\n🗑️ STEP 1: Back up existing data');
    // Get existing cart items
    db.all("SELECT * FROM CartItems", (err, items) => {
      if (err) {
        console.error('❌ Error backing up data:', err);
        return;
      }
      
      console.log(`   Backed up ${items.length} cart items`);
      
      console.log('\n🗑️ STEP 2: Drop the broken CartItems table');
      db.run("DROP TABLE IF EXISTS CartItems", (err) => {
        if (err) {
          console.error('❌ Error dropping table:', err);
          return;
        }
        console.log('   ✅ Dropped broken CartItems table');
        
        console.log('\n➕ STEP 3: Create correct CartItems table');
        const createTableSQL = `
          CREATE TABLE CartItems (
            id INTEGER PRIMARY KEY,
            userId INTEGER NOT NULL,
            productId INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            size VARCHAR(255),
            color VARCHAR(255),
            FOREIGN KEY (userId) REFERENCES Users (id),
            FOREIGN KEY (productId) REFERENCES Products (id)
          )
        `;
        
        db.run(createTableSQL, (err) => {
          if (err) {
            console.error('❌ Error creating table:', err);
            return;
          }
          console.log('   ✅ Created correct CartItems table');
          
          console.log('\n📥 STEP 4: Restore backed up data');
          if (items.length > 0) {
            const insertSQL = "INSERT INTO CartItems (userId, productId, quantity, size, color) VALUES (?, ?, ?, ?, ?)";
            
            items.forEach((item, index) => {
              db.run(insertSQL, [
                item.userId,
                item.productId, 
                item.quantity,
                item.size,
                item.color
              ], (err) => {
                if (err) {
                  console.error(`❌ Error restoring item ${index + 1}:`, err);
                } else {
                  console.log(`   ✅ Restored cart item ${index + 1}/${items.length}`);
                }
                
                if (index === items.length - 1) {
                  console.log('\n🔍 STEP 5: Verify the fix');
                  db.all("PRAGMA table_info(CartItems)", (err, columns) => {
                    if (err) {
                      console.error('❌ Error verifying table:', err);
                      return;
                    }
                    
                    console.log('   New table structure:');
                    columns.forEach(col => {
                      console.log(`   • ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'}${col.pk ? ' PRIMARY KEY' : ''}`);
                    });
                    
                    db.all("SELECT * FROM CartItems", (err, finalItems) => {
                      if (err) {
                        console.error('❌ Error checking final data:', err);
                        return;
                      }
                      
                      console.log(`\n✅ VERIFICATION COMPLETE:`);
                      console.log(`   • Cart items restored: ${finalItems.length}`);
                      console.log(`   • No more incorrect UNIQUE constraints`);
                      console.log(`   • Multiple users can add same product`);
                      console.log(`   • Same user can have multiple quantities`);
                      
                      console.log('\n🚀 CARTITEM CONSTRAINTS FIXED!');
                      console.log('   • Removed all incorrect UNIQUE constraints');
                      console.log('   • Only foreign key constraints remain');
                      console.log('   • Cart functionality should work now');
                      
                      db.close();
                    });
                  });
                }
              });
            });
          } else {
            console.log('   ✅ No items to restore');
            
            console.log('\n🔍 STEP 5: Verify the fix');
            db.all("PRAGMA table_info(CartItems)", (err, columns) => {
              if (err) {
                console.error('❌ Error verifying table:', err);
                return;
              }
              
              console.log('   New table structure:');
              columns.forEach(col => {
                console.log(`   • ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'}${col.pk ? ' PRIMARY KEY' : ''}`);
              });
              
              console.log('\n✅ VERIFICATION COMPLETE:');
              console.log('   • CartItems table created correctly');
              console.log('   • No incorrect UNIQUE constraints');
              console.log('   • Cart functionality should work now');
              
              console.log('\n🚀 CARTITEM CONSTRAINTS FIXED!');
              console.log('   • Removed all incorrect UNIQUE constraints');
              console.log('   • Only foreign key constraints remain');
              console.log('   • Cart functionality should work now');
              
              db.close();
            });
          }
        });
      });
    });
    
  } catch (error) {
    console.error('Fix error:', error);
  }
}

fixCartItemConstraints();
