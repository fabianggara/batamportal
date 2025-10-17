import { Router } from 'express';
import { getRecommendations, getPopularRecommendations } from '../controllers/recommendationController';
const router = Router();

// Rute ini akan menjadi GET /api/recommendations
router.get('/', getRecommendations);

// URL: GET /api/recommendations/popular
router.get('/popular', getPopularRecommendations);

export default router;