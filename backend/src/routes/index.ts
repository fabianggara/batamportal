// src/routes/index.ts
import { Router } from 'express';

// 1. Impor semua file rute dari setiap fitur
import authRoutes from './authRoutes';
import passwordRoutes from './password'; // Mengimpor dari folder /password
import submissionsRoutes from './submissionsRoutes'; // Asumsi Anda punya file ini

const router = Router();

// 2. Daftarkan setiap rute dengan awalan (prefix) yang sesuai
// Contoh: Semua rute di authRoutes akan diakses melalui /auth/...
// URL Final: /api/auth/login, /api/auth/me, dst.
router.use('/auth', authRoutes);

// URL Final: /api/password/forgot, /api/password/reset, dst.
router.use('/password', passwordRoutes);

// URL Final: /api/submissions/...
router.use('/submissions', submissionsRoutes);


// 3. Ekspor router utama untuk digunakan oleh app.ts
export default router;