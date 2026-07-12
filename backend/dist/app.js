import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { createV1Router } from './routes/v1/index.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow serving static images across origins
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
// Static files (for meal images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Register V1 API Routes
app.use('/api/v1', createV1Router());
// Global Error Handler
app.use(errorHandler);
export default app;
