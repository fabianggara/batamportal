// backend/src/routes/businesses/routes.ts
import { authenticate } from "@/middleware/authMiddleware"; // Sesuaikan path jika berbeda
import { Router } from "express";
import {
    getAllBusinesses,        // Admin List
    getBusinessById,         // Admin Preview/Edit (Bisa lihat pending)
    getBusinessesByCategory, // PUBLIC (Hanya approved)
    createBusiness,          // Admin/User Create
    updateBusiness,          // Admin Update
    deleteBusiness,          // Admin Delete
    uploadMedia,             // Admin Upload
    getBusinessReviews,     
    createBusinessReview,
    deleteBusinessReview
} from "@/controllers/businessesDataController";
import { upload } from "@/middleware/upload";

const router = Router();

// --- PUBLIC ROUTES ---
// Mengambil bisnis berdasarkan kategori (misal: /api/businesses/category/kuliner)
router.get("/category/:categorySlug", getBusinessesByCategory);


// --- ADMIN / GENERAL ROUTES ---

// 1. GET All (Untuk Tabel Admin)
router.get("/", getAllBusinesses);

// 2. GET Single by ID (Untuk Preview & Edit di Admin Panel)
// PENTING: Ditaruh SETELAH route /category/... agar tidak bentrok
router.get("/:id", getBusinessById);

// 3. POST Create (Daftar Bisnis Baru)
router.post("/", 
    upload.fields([
        { name: 'thumbnail_picture', maxCount: 1 }, 
        { name: 'media_files', maxCount: 10 }
    ]),
    createBusiness
);

// 4. PUT Update (Simpan Edit)
router.put('/:id', upload.fields([
    { name: 'thumbnail_picture', maxCount: 1 }, 
    { name: 'media_files', maxCount: 10 }
]), updateBusiness);

// 5. DELETE (Hapus Bisnis)
router.delete("/:id", deleteBusiness);

// 6. Upload Media Tambahan
router.post("/:id/media", upload.array("media_files", 10), uploadMedia);


// 7. GET Reviews (Ambil daftar ulasan)
router.get("/:id/reviews", getBusinessReviews);

// 8. POST Review (Kirim ulasan baru - Wajib Login)
router.post("/:id/reviews", authenticate, upload.single('image'), createBusinessReview);

router.delete("/:businessId/reviews/:reviewId", authenticate, deleteBusinessReview);

export default router;