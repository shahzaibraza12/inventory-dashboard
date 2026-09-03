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