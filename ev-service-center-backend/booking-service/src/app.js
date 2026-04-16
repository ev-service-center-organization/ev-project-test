import express from 'express';
import 'dotenv/config';
import bookingRoutes from './routes/bookingRoutes.js';
import serviceCenterRoutes from './routes/serviceCenterRoutes.js';

const app = express();
app.use(express.json());

app.use('/booking', bookingRoutes);
app.use('/service-center', serviceCenterRoutes);

export default app;