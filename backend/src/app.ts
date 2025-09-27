// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import './types'; // Dipertahankan dari 'current code'

// Menggunakan SATU router utama, ini adalah praktik terbaik
import mainApiRouter from './routes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Sama seperti sebelumnya)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check (Menggabungkan info 'environment' dari 'incoming code')
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development' // Ditambahkan
    });
});

// Middleware logging dari 'incoming code' untuk semua rute API
app.use('/api', (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Menggunakan SATU router utama untuk semua rute di bawah /api
app.use('/api', mainApiRouter);

// Handler 404 (Tidak ada perubahan)
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler (Tidak ada perubahan)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Server start logic (Tidak ada perubahan)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
}

export default app;