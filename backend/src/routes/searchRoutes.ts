import { Router } from 'express';
import { handleSearch } from '../controllers/searchController';

const router = Router();

// Rute ini akan menjadi GET /api/search?q=...
router.get('/', handleSearch);

export default router;