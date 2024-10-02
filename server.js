const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Uncomment this
const twilio = require('twilio'); 

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
        origin: "http://localhost:4200"
    }
))
app.options('*', cors())
// CORS configuration
/*const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests from localhost during development
        if (origin === 'http://localhost:4200' || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions)); // Use CORS with the defined options
app.options('*', cors()); // Handle preflight requests*/
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://JPRcrackers:Since2024@jprcrackers.bcz4s.mongodb.net/mydatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Twilio configuration
const accountSid = 'AC025d1c50eb4a99709568b2fb6e8cdbd6'; // Your Account SID
const authToken = 'b7fcf1dc18f71da560cf70b6bfd999c6'; // Your Auth Token
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = '+14159034427'; // Your Twilio phone number

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
        
        // Send SMS using Twilio
        const message = `Congratulations! New order arrived!\nMr/Mrs ${customerInfo.name} with Rs. ${totalAmount}.\nDo check www.jprcrackers.com/admin for further details. Thank you!`;
        await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: '+916380331212',
        });

        res.status(201).json({ message: 'Bill saved successfully and SMS sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save bill or send SMS' });
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
