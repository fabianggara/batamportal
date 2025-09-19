// src/routes/authRoutes.ts
import { Router } from 'express';
// Impor semua fungsi controller yang relevan
import { login, logout, signup, me } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware'; // Kita akan butuh ini

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/signup', signup);
router.get('/me', authenticate, me); // Lindungi rute 'me' dengan middleware

export default router;