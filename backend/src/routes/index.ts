import { Router } from 'express';

// Impor rute lain
import authRoutes from './authRoutes';
import passwordRoutes from './password';
import searchRoutes from './searchRoutes';
import hotelRoutes from './kategori/hotel/route';
import recommendationRoutes from './recommendationRoutes';
import { getHomepageRecommendations } from '../controllers/homepageController';
import submissionsRoutes from './submissionsRoutes'; 
import categoryRoutes from './categoryRoutes';
import businessesRoutes from './businesses/routes';
import interactionRoutes from 'routes/interaction/route';
import tagsRoutes from 'routes/tags/route';
import userRoutes from './userRoutes';
import kulinerSubmitRoutes from 'routes/submit-form/kuliner/route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/search', searchRoutes);
router.use('/hotel', hotelRoutes);
router.use('/recommendations', recommendationRoutes);
router.get('/homepage-recommendations', getHomepageRecommendations);
router.use('/categories', categoryRoutes);
router.use('/interaction', interactionRoutes);
router.use('/tags', tagsRoutes);
router.use('/businesses', businessesRoutes);
router.use('/submit-form/kuliner', kulinerSubmitRoutes);
router.use('/users', userRoutes);

export default router;