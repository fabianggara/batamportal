// backend/src/routes/submit-form/kuliner/routes.ts
import { Router } from 'express';
import { submitKulinerController } from '../../../controllers/kulinerController'; // (Anda perlu membuat controller ini)
import { upload } from '../../../middleware/upload'; // (Sesuaikan nama impornya)

const router = Router();

// Gunakan middleware upload. 'gallery' adalah nama field di FormData
// '10' adalah batas maksimal file
router.post(
  '/', 
  upload.array('gallery', 10), // atau .fields([...])
  submitKulinerController 
);

export default router;