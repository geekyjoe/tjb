// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Database connection
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
// users/models/User.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// users/models/Order.js
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'pending' },
  orderDate: { type: Date, default: Date.now },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  orderToken: String
});

// products/models/Product.js
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes
// users/routes/auth.js
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// products/routes/products.js
app.get('/api/products', async (req, res) => {
  try {
    const { category, gender, minPrice, maxPrice, sortBy } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    
    let products = await Product.find(query);
    
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
      }
    }
    
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// admin/routes/products.js
app.post('/api/admin/products', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, gender, stock } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const product = await Product.create({
      title,
      description,
      price,
      category,
      gender,
      imageUrl,
      stock,
      isAvailable: stock > 0
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// users/routes/orders.js
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;
    
    // Calculate total amount and verify stock
    let totalAmount = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.title}`);
      }
      totalAmount += product.price * item.quantity;
      
      // Update stock
      product.stock -= item.quantity;
      if (product.stock === 0) product.isAvailable = false;
      await product.save();
    }
    
    // Generate order token
    const orderToken = crypto.randomBytes(16).toString('hex');
    
    const order = await Order.create({
      userId: req.user.id,
      orderItems,
      totalAmount,
      shippingAddress,
      orderToken
    });
    
    res.status(201).json({
      orderId: order._id,
      orderToken,
      totalAmount,
      status: order.orderStatus
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});