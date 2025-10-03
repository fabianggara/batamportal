import { Router } from 'express';

// Impor rute lain
import authRoutes from './authRoutes';
import passwordRoutes from './password';
import searchRoutes from './searchRoutes';
import hotelRoutes from './kategori/hotel/route';
import recommendationRoutes from './recommendationRoutes';
import { getHomepageRecommendations } from '../controllers/homepageController';
import submissionsRoutes from './submissions/routes'; 
import categoryRoutes from './categoryRoutes';
import businessesRoutes from './businessesRoutes';

const router = Router();

// ... (kode lainnya tidak perlu diubah) ...
router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/businesses', submissionsRoutes);
router.use('/search', searchRoutes);
router.use('/hotel', hotelRoutes);
router.use('/recommendations', recommendationRoutes);
router.get('/homepage-recommendations', getHomepageRecommendations);
router.use('/categories', categoryRoutes);
router.use('/businesses', businessesRoutes);


export default router;