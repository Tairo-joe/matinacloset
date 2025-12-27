# 📧 Gmail Email Service Setup Guide

## 🚀 Quick Setup Instructions

### 1. Install Nodemailer
```bash
cd server
npm install nodemailer
```

### 2. Enable 2-Factor Authentication on Gmail
- Go to your Google Account settings
- Enable 2-Factor Authentication (2FA)
- This is required for App Passwords

### 3. Create an App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" for the app
3. Select "Other (Custom name)" and name it "MatinaCloset"
4. Google will generate a 16-character password
5. Copy this password (you won't see it again!)

### 4. Configure Environment Variables
Edit the `.env` file in your server folder:

```env
# Replace with your actual Gmail and App Password
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# Keep this JWT secret secure!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 5. Test the Email Service
1. Restart your server
2. Go to the login page
3. Click "Forgot password?"
4. Enter your email
5. Check your Gmail inbox!

## 🔧 Troubleshooting

### "Invalid login" Error
- Make sure you're using an App Password, not your regular Gmail password
- Ensure 2FA is enabled on your Google Account
- Double-check the email and password in your .env file

### "Less secure app access" Error
- Google no longer supports "Less secure app access"
- You must use an App Password instead
- Enable 2-Factor Authentication first

### Email Not Arriving
- Check your spam folder
- Verify the email address is correct
- Check server console for error messages

## 🎨 Email Template Features

The email includes:
- ✅ Professional HTML design
- ✅ Responsive layout for mobile
- ✅ Your store logo
- ✅ Security notice
- ✅ Expiration warning
- ✅ Backup text link
- ✅ Professional branding

## 🛡️ Security Features

- ✅ Tokens expire in 1 hour
- ✅ Secure token generation
- ✅ Email enumeration protection
- ✅ Error handling for failed emails
- ✅ Professional security notices

## 📱 What Your Users Will See

1. **Password Reset Request** - Professional email with your branding
2. **Reset Button** - One-click password reset
3. **Security Notice** - Information about link expiration
4. **Backup Link** - Copy-paste option if button doesn't work
5. **Professional Footer** - Your store information

Once configured, your forgot password feature will send real emails! 🚀
