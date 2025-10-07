// src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Impor ini dari 'current' untuk tipe kustom jika ada.
import './types';

// Praktik terbaik adalah menggunakan satu file index di dalam folder routes
// untuk mengelola semua rute. Kita asumsikan semua rute dari 'incoming'
// sudah terdaftar di dalam './routes'.
import mainApiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Menggunakan konfigurasi helmet dari 'current' yang lebih spesifik.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // <-- TAMBAHKAN INI
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files (uploads)
// Menggunakan path.join(process.cwd(), 'uploads') dari 'current' yang lebih robust.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
// Mengambil versi yang lebih informatif dari 'incoming'.
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware logging untuk API dari 'incoming'.
app.use('/api', (req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Menggunakan SATU router utama dari 'current' untuk semua rute di bawah /api.
app.use('/api', mainApiRouter);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler
// Mengambil versi dari 'incoming' dengan format yang sedikit lebih rapi.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    });
});

// Server start logic
// Mengambil versi dari 'incoming' dengan logging yang lebih detail.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
}

export default app;