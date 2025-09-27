import { Router } from 'express';
import { getHotelById } from '../../../controllers/hotelController';

const router = Router();

// Rute ini akan menjadi GET /api/hotel/:id
router.get('/:id', getHotelById);

export default router;