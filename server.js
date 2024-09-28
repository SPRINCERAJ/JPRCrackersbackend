// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin:'http://localhost:4200'
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://JPRcrackers:Since2024@jprcrackers.bcz4s.mongodb.net/mydatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Bill Schema
const billSchema = new mongoose.Schema({
  customerInfo: {
    name: String,
    mobile: String,
    address: String,
    state: String,
    city: String,
  },
  items: [
    {
      name: String,
      quantity: Number,
      total: Number,
    },
  ],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

const Bill = mongoose.model('Bill', billSchema);

// API endpoint to save the bill
app.post('/api/bills', async (req, res) => {
  const { customerInfo, items, totalAmount } = req.body;

  const newBill = new Bill({
    customerInfo,
    items,
    totalAmount,
  });

  try {
    await newBill.save();
    res.status(201).json({ message: 'Bill saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save bill' });
  }
});



// API endpoint to fetch all bills
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
