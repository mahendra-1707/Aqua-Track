require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
// Replace process.env.MONGODB_URI with your MongoDB Atlas connection string
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/waterDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schema and Model for Sensor Data
const dataSchema = new mongoose.Schema({
  pH: { type: Number, required: true },
  tds: { type: Number, required: true },
  turbidity: { type: Number, required: true },
  temperature: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', dataSchema);

// API Endpoints
// POST Endpoint for ESP32 to send data
app.post('/api/data', async (req, res) => {
  try {
    const { pH, tds, turbidity, temperature } = req.body;
    const newData = new SensorData({ pH, tds, turbidity, temperature });
    await newData.save();
    res.status(201).json({ message: 'Data saved successfully', data: newData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// GET Endpoint for Dashboard to fetch the latest reading
app.get('/api/data/latest', async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(latestData || { message: 'No data available' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET Endpoint for Dashboard to fetch historical data for charts
app.get('/api/data/history', async (req, res) => {
  try {
    const history = await SensorData.find().sort({ timestamp: 1 }).limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Entry Point
app.get('/', (req, res) => {
  res.send('AquaGuard API is running.');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
