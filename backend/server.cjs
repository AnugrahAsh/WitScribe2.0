const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variables

// In-memory storage for users (Replace with a database in production)
const users = [];

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both origins
  credentials: true
}));

// Helper functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Add user object to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      verified: user.verified
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Public routes
app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password: hashedPassword,
      verified: false
    };
    
    users.push(newUser);
    
    // Generate token
    const token = generateToken(newUser.id);
    
    // Set cookie
    res.cookie('token', token, { 
      httpOnly: true,
      maxAge: 3600000 // 1 hour
    });
    
    console.log(`User registered: ${name}, ${email}`);
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        verified: newUser.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    // Find user by username or email
    const user = users.find(u => 
      u.name === username || u.email === username
    );
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Set cookie
    res.cookie('token', token, { 
      httpOnly: true,
      maxAge: 3600000 // 1 hour
    });
    
    console.log(`User logged in: ${user.name}`);
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Protected routes - use the authenticate middleware
app.post('/verify', authenticate, (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    
    // Find user
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // In a real app, you'd verify the code
    // For demo, we'll just mark as verified
    user.verified = true;
    
    return res.status(200).json({
      success: true,
      message: 'User verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during verification' 
    });
  }
});

app.get('/user', authenticate, (req, res) => {
  // User data is already available in req.user from the middleware
  return res.status(200).json({
    success: true,
    data: req.user
  });
});

// Example of another protected route
app.get('/dashboard', authenticate, (req, res) => {
  // Here you would fetch data specific to the authenticated user
  return res.status(200).json({
    success: true,
    message: 'Welcome to your dashboard',
    user: req.user.name,
    // Other dashboard data would go here
    stats: {
      visits: 42,
      actions: 12,
      notifications: 5
    }
  });
});

// Example of a route that requires verification
app.get('/premium-content', authenticate, (req, res) => {
  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required to access premium content'
    });
  }
  
  return res.status(200).json({
    success: true,
    message: 'Access to premium content granted',
    content: 'This is exclusive content for verified users only'
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`Authentication server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for origins: http://localhost:5173, http://localhost:3000`);
});