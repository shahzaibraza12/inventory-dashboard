const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Yeh line Express ko batayegi ke frontend files kahan hain
app.use(express.static(__dirname));

// Root route par index.html bhejne ke liye taake "Cannot GET /" na aaye
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// In-Memory Inventory Data
let inventoryItems = [
  { id: 1, name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', price: 25.99, stock: 120 },
  { id: 2, name: 'Mechanical Keyboard', sku: 'MK-002', category: 'Electronics', price: 79.99, stock: 45 },
  { id: 3, name: 'Ergonomic Office Chair', sku: 'EOC-003', category: 'Furniture', price: 149.99, stock: 5 }
];

// 1. Get all inventory items
app.get('/api/inventory', (req, res) => {
  res.status(200).json({ success: true, count: inventoryItems.length, data: inventoryItems });
});

// 2. Add a new product
app.post('/api/inventory', (req, res) => {
  const { name, sku, category, price, stock } = req.body;
  
  if (!name || !sku || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const newItem = {
    id: inventoryItems.length ? inventoryItems[inventoryItems.length - 1].id + 1 : 1,
    name,
    sku,
    category: category || 'General',
    price: parseFloat(price),
    stock: parseInt(stock)
  };

  inventoryItems.push(newItem);
  res.status(201).json({ success: true, message: 'Product added successfully', data: newItem });
});

// 3. Delete a product from inventory
app.delete('/api/inventory/:id', (req, res) => {
  const itemIndex = inventoryItems.findIndex(i => i.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const deletedItem = inventoryItems.splice(itemIndex, 1);
  res.status(200).json({ success: true, message: 'Product deleted successfully', data: deletedItem[0] });
});

// 4. Update an existing product / stock level
app.put('/api/inventory/:id', (req, res) => {
  const itemIndex = inventoryItems.findIndex(i => i.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, sku, category, price, stock } = req.body;

  inventoryItems[itemIndex] = {
    ...inventoryItems[itemIndex],
    name: name || inventoryItems[itemIndex].name,
    sku: sku || inventoryItems[itemIndex].sku,
    category: category || inventoryItems[itemIndex].category,
    price: price !== undefined ? parseFloat(price) : inventoryItems[itemIndex].price,
    stock: stock !== undefined ? parseInt(stock) : inventoryItems[itemIndex].stock
  };

  res.status(200).json({ success: true, message: 'Inventory updated successfully', data: inventoryItems[itemIndex] });
});

// Start Server (Isko hamesha aakhir mein rakhte hain)
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

// In-memory store for OTPs (Production mein database use hota hai)
const otpStore = {};

// Nodemailer Transporter setup (Apni Gmail aur App Password yahan lagayein)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'AapkiEmail@gmail.com',       // Yahan apni email dein
        pass: 'AapkaGmailAppPassword'       // Yahan Gmail ka App Password dein
    }
});

// 1. API to Send OTP Email
api.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp; // Save OTP against email

    const mailOptions = {
        from: 'AapkiEmail@gmail.com',
        to: email,
        subject: 'E-Store Password Reset OTP',
        text: `Your password reset verification code is: ${otp}. It is valid for a short time.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Verification code sent to your email!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
    }
});

// 2. API to Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email]; // OTP use hone ke baad delete kar dein
        res.json({ success: true, message: 'OTP verified successfully!' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP code!' });
    }
});

// Server.js ke andar ye Signup aur Login routes add karein

// In-memory user store (Aap chhein toh bad mein database se connect kar sakte hain)
let usersList = [];

// 1. Signup API
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = usersList.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email is already registered!' });
    }

    // Save new customer
    usersList.push({ name, email, password, role: 'customer' });
    res.json({ success: true, message: 'Customer account created successfully!' });
});

// 2. Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Hardcoded Admin account (Company credentials)
    if (email === 'admin@estore.com' && password === 'admin123') {
        return res.json({ 
            success: true, 
            user: { name: 'Store Admin', email, role: 'admin' },
            message: 'Login successful as Admin' 
        });
    }

    // Check in registered users
    const user = usersList.find(u => u.email === email && u.password === password);
    if (user) {
        return res.json({ 
            success: true, 
            user: { name: user.name, email: user.email, role: user.role },
            message: 'Login successful' 
        });
    }

    res.status(400).json({ success: false, message: 'Invalid email or password!' });
});