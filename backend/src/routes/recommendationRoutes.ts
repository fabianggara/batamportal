import { Router } from 'express';
import { getRecommendations, getPopularRecommendations, getPersonalizedRecommendations, resetPersonalRecommendations } from '../controllers/recommendationController';import { authenticate } from '../middleware/authMiddleware'; 
const router = Router();

// Rute ini akan menjadi GET /api/recommendations
router.get('/', getRecommendations);

// URL: GET /api/recommendations/popular
router.get('/popular', getPopularRecommendations);

// Rute ini akan menjadi GET /recommendations/for-me (Rekomendasi Personal)
router.get('/for-me', authenticate, getPersonalizedRecommendations); 

router.delete('/reset', authenticate, resetPersonalRecommendations);

export default router;