import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import rfpRoutes from './routes/rfpRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import { checkForNewEmails } from './services/emailService.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RFP Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Email polling interval: ${process.env.EMAIL_POLL_INTERVAL || 60000}ms`);
      
      // Start email polling (optional - can be triggered manually via API)
      if (process.env.AUTO_CHECK_EMAILS === 'true') {
        const pollInterval = parseInt(process.env.EMAIL_POLL_INTERVAL) || 60000;
        setInterval(async () => {
          try {
            console.log('🔍 Checking for new emails...');
            await checkForNewEmails();
          } catch (error) {
            console.error('Error in email polling:', error);
          }
        }, pollInterval);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
