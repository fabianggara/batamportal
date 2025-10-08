// backend/src/app.ts
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import signupRouter from './routes/signup/routes';
import loginRouter from './routes/login/routes';
import meRoutes from "./routes/auth/meRoutes";
import forgotPassRoutes from './routes/password/forgot/routes';
import businessesRouter from './routes/businesses/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uploadsPath: path.join(__dirname, '../uploads')
    });
});

// Request logging middleware
app.use('/api', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// API routes
app.use('/api/signup', signupRouter);
app.use("/api/login", loginRouter);
app.use("/api/me", meRoutes);
app.use("/api/password", forgotPassRoutes);
app.use('/api/businesses', businessesRouter);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Error Handler:', err);
    
    // Multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File terlalu besar. Maksimal 10MB per file.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Terlalu banyak file. Maksimal 50 file.'
            });
        }
        return res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`
        });
    }
    
    // File type errors
    if (err.message && err.message.includes('File type not allowed')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    // Default error response
    return res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        console.log(`📂 Uploads directory: ${path.join(__dirname, '../uploads')}`);
        console.log(`✅ Server ready to accept requests`);
    });
}

export default app;

// import express from 'express';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import helmet from 'helmet';
// import compression from 'compression';
// import dotenv from 'dotenv';
// import path from 'path';

// // Import routes
// import signupRouter from './routes/signup/routes';
// import loginRouter from './routes/login/routes';
// import meRoutes from "./routes/auth/meRoutes";
// import forgotPassRoutes from './routes/password/forgot/routes';

// import businessesRouter from './routes/businesses/routes';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(helmet());
// app.use(compression());
// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
// }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(cookieParser())

// // Serve static files (uploads)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// // Health check
// app.get('/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         environment: process.env.NODE_ENV || 'development'
//     });
// });


// // API routes
// app.use('/api', (req, res, next) => {
//     console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
//     next();
// });

// // Routes
// app.use('/api/signup', signupRouter);
// app.use("/api/login", loginRouter);
// app.use("/api/me", meRoutes);
// app.use("/api/password", forgotPassRoutes);

// app.use('/api/businesses', businessesRouter);
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// // 404 handler
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Route not found',
//         path: req.originalUrl
//     });
// });

// // Error handler
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//     console.error('Error:', err);
//     res.status(500).json({
//         error: process.env.NODE_ENV === 'production' 
//         ? 'Internal server error' 
//         : err.message
//     });
// });

// if (require.main === module) {
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on port ${PORT}`);
//         console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
//         console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
//     });
// }

// export default app;