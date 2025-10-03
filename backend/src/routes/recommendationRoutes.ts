import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController';

const router = Router();

// Rute ini akan menjadi GET /api/recommendations
router.get('/', getRecommendations);

export default router;