# Admin Login Debug Guide

## 🔍 **Issue: "Failed to save product: Not found"**

### **🎯 Most Likely Cause:**
You're not logged in as admin, or your authentication token has expired.

### **🔧 Quick Fix Steps:**

#### **✅ Step 1: Login as Admin**
1. **Go to**: `http://localhost:4000/login.html`
2. **Email**: `admin@matinacloset.com`
3. **Password**: `Admin123!`
4. **Click Login**

#### **✅ Step 2: Verify Admin Access**
1. After login, check if you see "Admin" in the user dropdown
2. Click "Admin" to go to admin panel
3. You should see the products management page

#### **✅ Step 3: Check Browser Console**
1. Press `F12` to open developer tools
2. Go to "Console" tab
3. Try creating a product
4. Look for these messages:
   - `Current user: {...}` - Shows logged in user
   - `🌐 API Request: POST /api/products` - Shows API call
   - `📡 API Response: 201 Created` - Success
   - `❌ API Error Details: {...}` - Error details

### **🚨 If Still Not Working:**

#### **✅ Check Authentication Token**
1. In browser console, type: `localStorage.getItem('mc_token')`
2. Should return a JWT token (long string)
3. If `null`, you're not logged in

#### **✅ Check User Data**
1. In browser console, type: `localStorage.getItem('mc_user')`
2. Should return user object with `"role":"admin"`
3. If `null`, you're not logged in

#### **✅ Clear Cache and Relogin**
1. In browser console: `localStorage.clear()`
2. Refresh page: `http://localhost:4000/login.html`
3. Login again with admin credentials

### **🔍 Debug Messages Added:**
I've added better error logging to the admin products page. Now you'll see:
- `Current user: {...}` - Shows who's logged in
- `User is not admin, redirecting...` - If not admin
- `Full error details: {...}` - Complete error info

### **🛠️ Advanced Debugging:**

#### **✅ Check Server Logs**
1. Look at server console output
2. Should see: `Creating product: {...}`
3. Should see: `Product created successfully: 123 ProductName`

#### **✅ Check Network Tab**
1. Press `F12` → "Network" tab
2. Try creating product
3. Look for `POST /api/products` request
4. Check status code (should be 201)
5. Check response payload

### **🎯 Expected Flow:**
1. **Login** → Token stored in localStorage
2. **Admin Panel** → Token sent with API requests
3. **Create Product** → Server validates admin role
4. **Success** → Product saved to database

### **⚠️ Common Issues:**
- **Expired token**: Logout and login again
- **Wrong credentials**: Use exact admin email/password
- **Browser cache**: Clear localStorage
- **Server not running**: Check server is on port 4000

### **🚀 Test After Fix:**
1. Login as admin
2. Go to admin products page
3. Click "Add Product"
4. Fill form with women's category
5. Add image
6. Save product
7. Should see success message

**The error "Not found" is likely authentication - follow these steps to fix!**
