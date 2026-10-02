import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import serviceRequestRoutes from './routes/serviceRequestRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RoadGuard API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
