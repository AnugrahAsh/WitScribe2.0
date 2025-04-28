const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { Home } = require('lucide-react');
const app = express();

// Environment variables (in production, use dotenv)
const JWT_SECRET = 'your-secret-key-should-be-longer-and-more-secure';
const MONGODB_URI = 'mongodb://localhost:27017/witscribe';
const PORT = 5000;

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

app.get('/home', (req, res) => {
    res.json({ message: 'Welcome to WitScribe!' }, Home);
    })

// // Email OTP function
// const sendOTPEmail = async (email, otp) => {
//   try {
//     // Create a transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'witscribe@gmail.com',
//         pass: 'zjnl nxyh fcgm ctem'
//       }
//     });

//     // Define email options
//     const mailOptions = {
//       from: 'witscribe@gmail.com',
//       to: email,
//       subject: 'Your OTP for WitScribe Registration',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
//           <h2 style="color: #E63946; text-align: center;">WitScribe Registration</h2>
//           <p>Thank you for registering with WitScribe!</p>
//           <p>Your One-Time Password (OTP) is:</p>
//           <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p>This OTP will expire in 10 minutes. Please do not share this OTP with anyone.</p>
//           <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">This is an automated message, please do not reply to this email.</p>
//         </div>
//       `
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.response);
//     return true;
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return false;
//   }
// };

// // Generate token function
// const generateToken = (id) => {
//   return jwt.sign({ id }, JWT_SECRET, {
//     expiresIn: '28d' // 28 days
//   });
// };

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
    });
    
    // Save user to database
    await newUser.save();
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please verify your email.',
      data: { id: newUser._id }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Verify OTP route
app.post('/otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'User ID and OTP are required' });
    }
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if OTP is valid and not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 28 * 24 * 60 * 60 * 1000, // 28 days
      secure: process.env.NODE_ENV === 'production', // use secure in production
      sameSite: 'strict'
    });
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Resend OTP route
// app.post('/resend-otp', async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }
    
//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     // Generate new OTP
//     const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Update user's OTP and expiration
//     user.otp = newOTP;
//     user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//     await user.save();
    
//     // Send OTP via email
//     const emailSent = await sendOTPEmail(email, newOTP);
//     if (!emailSent) {
//       return res.status(500).json({ success: false, message: 'Failed to send OTP email' });
//     }
    
//     res.json({ success: true, message: 'A new OTP has been sent to your email' });
//   } catch (error) {
//     console.error('Resend OTP error:', error);
//     res.status(500).json({ success: false, message: 'Failed to resend OTP' });
//   }
// });

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for unverified users
      const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = newOTP;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      // Send OTP via email
      await sendOTPEmail(email, newOTP);
      
      return res.status(403).json({ 
        success: false, 
        message: 'Account not verified. A new verification code has been sent to your email.',
        data: { id: user._id }
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 28 * 24 * 60 * 60 * 1000, // 28 days
      secure: process.env.NODE_ENV === 'production', // use secure in production
      sameSite: 'strict'
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user route (protected)
app.get('/user', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Password reset request route
// app.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
    
//     if (!email) {
//       return res.status(400).json({ success: false, message: 'Email is required' });
//     }
    
//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     // Generate reset OTP
//     const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Update user's OTP and expiration
//     user.otp = resetOTP;
//     user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//     await user.save();
    
//     // Send reset OTP via email
//     const emailSent = await sendOTPEmail(email, resetOTP);
//     if (!emailSent) {
//       return res.status(500).json({ success: false, message: 'Failed to send reset OTP' });
//     }
    
//     res.json({ 
//       success: true, 
//       message: 'Password reset OTP has been sent to your email',
//       data: { id: user._id }
//     });
//   } catch (error) {
//     console.error('Password reset request error:', error);
//     res.status(500).json({ success: false, message: 'Failed to process password reset request' });
//   }
// });

// // Reset password route
// app.post('/reset-password', async (req, res) => {
//   try {
//     const { userId, otp, newPassword } = req.body;
    
//     if (!userId || !otp || !newPassword) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }
    
//     // Find user by ID
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }
    
//     // Check if OTP is valid and not expired
//     if (user.otp !== otp || user.otpExpires < new Date()) {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
    
//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
    
//     // Update password and clear OTP fields
//     user.password = hashedPassword;
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();
    
//     res.json({ success: true, message: 'Password reset successful' });
//   } catch (error) {
//     console.error('Password reset error:', error);
//     res.status(500).json({ success: false, message: 'Failed to reset password' });
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});