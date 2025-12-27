console.log('🛒 CHECKING LOCAL STORAGE CART DATA');
console.log('=' .repeat(50));

console.log('\n🔍 WHAT TO CHECK:');
console.log('   1. Open Developer Tools (F12)');
console.log('   2. Go to Application tab');
console.log('   3. Under Storage → Local Storage');
console.log('   4. Find your site (localhost:4000)');
console.log('   5. Look for "mc_cart" entry');

console.log('\n🎯 LIKELY ISSUE:');
console.log('   • You have old cart items in localStorage');
console.log('   • When you visit admin page, cart merge is triggered');
console.log('   • Cart items have invalid product IDs');
console.log('   • This causes validation errors');

console.log('\n🗑️ QUICK FIX:');
console.log('   1. In Developer Tools → Application → Local Storage');
console.log('   2. Find "mc_cart" entry');
console.log('   3. Delete it');
console.log('   4. Refresh admin page');
console.log('   5. Error should disappear');

console.log('\n🔧 WHATS HAPPENING:');
console.log('   • Old cart items stored in browser');
console.log('   • Cart merge tries to add them to server');
console.log('   • Product IDs might not exist anymore');
console.log('   • Causes validation errors on admin page');

console.log('\n📱 ALTERNATIVE SOLUTION:');
console.log('   If you want to keep cart functionality:');
console.log('   1. Clear only invalid cart items');
console.log('   2. Or fix the mergeLocalToServer function');
console.log('   3. To handle invalid product IDs gracefully');

console.log('\n🚀 TEST THIS:');
console.log('   1. Clear mc_cart from localStorage');
console.log('   2. Visit admin page');
console.log('   3. Should see no cart errors');
console.log('   4. Test cart on main site - should work');

console.log('\n💡 PERMANENT FIX:');
console.log('   The cart merge function should validate');
console.log('   product IDs before trying to add them');
console.log('   to prevent this error in the future.');
