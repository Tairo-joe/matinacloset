const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-gmail@gmail.com', // Replace with your Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password'       // Replace with your App Password
  }
};

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

// Email templates
const emailTemplates = {
  forgotPassword: (resetLink, userName) => ({
    subject: 'Password Reset Request - MatinaCloset',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - MatinaCloset</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }
          .title {
            color: #667eea;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
          }
          .reset-button:hover {
            opacity: 0.9;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .security-note {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://your-domain.com/LOGO.jpeg" alt="MatinaCloset Logo" class="logo">
            <h1 class="title">Password Reset Request</h1>
          </div>
          
          <p>Hello ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your MatinaCloset account. Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="reset-button">Reset Password</a>
          </div>
          
          <div class="security-note">
            <strong>Security Notice:</strong><br>
            • This link will expire in 1 hour for security reasons<br>
            • If you didn't request this password reset, please ignore this email<br>
            • Never share this link with anyone
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
          
          <div class="footer">
            <p>Thank you for shopping at MatinaCloset!<br>
            <small>If you have any questions, please contact our support team.</small></p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    
    const emailContent = emailTemplates[template](...data);
    
    const mailOptions = {
      from: `"MatinaCloset" <${emailConfig.auth.user}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter
};
