const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Simulated admin users database (replace with actual database)
const admins = [];

// Secret key for JWT (store this securely, preferably in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Signup Validation Middleware
const signupValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Signup Route
router.post('/signup', signupValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = admins.find(admin => admin.email === email);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = {
      id: admins.length + 1,
      email,
      password: hashedPassword
    };
    admins.push(newAdmin);

    // Generate JWT token
    const token = jwt.sign(
      { id: newAdmin.id, email: newAdmin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'Admin created successfully', 
      token 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = admins.find(a => a.email === email);
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login successful', 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Token Validation Middleware
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Protected Route for Token Validation
router.post('/validate-token', validateToken, (req, res) => {
  // If the middleware passes, the token is valid
  res.json({ 
    message: 'Token is valid',
    admin: {
      id: req.admin.id,
      email: req.admin.email
    }
  });
});

// Logout Route (client-side logout by removing token)
router.post('/logout', (req, res) => {
  // Since JWT is stateless, logout is primarily handled client-side
  res.json({ message: 'Logout successful' });
});

module.exports = router;