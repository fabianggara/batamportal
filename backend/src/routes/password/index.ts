// src/routes/password/index.ts
import { Router } from 'express';
// Path berubah menjadi '../../' untuk keluar dari folder 'password' dan 'routes'
import { 
    forgotPassword, 
    resetPassword, 
    changePassword 
} from '../../controllers/passwordController';

import { authenticate } from '../../middleware/authMiddleware';

const router = Router();

router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

// Lindungi rute ini dengan middleware 'authenticate'
router.post('/change', authenticate, changePassword);

export default router;