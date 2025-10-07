// backend/src/routes/businesses/routes.ts
import express from "express";
import {
    getAllBusinesses,
    getRelatedBusinesses,
    getBusinessById, 
    createBusiness,  
    uploadMedia,
    updateBusiness,  
    deleteBusiness,  
} from "@/controllers/businessesDataController";
import { upload } from "@/middleware/upload";

const router = express.Router();

// --- ROUTE GET ---
router.get("/related", getRelatedBusinesses);
router.get("/", getAllBusinesses);
router.get("/:id", getBusinessById);

// --- ROUTE POST (Create Business) ---
router.post(
    "/", 
    // Menggunakan upload.fields untuk thumbnail dan media galeri
    upload.fields([
        { name: 'thumbnail_picture', maxCount: 1 }, // Logo Hotel
        { name: 'media_files', maxCount: 20 }     // Galeri Foto/Video
    ]),
    createBusiness // Memanggil fungsi createBusiness yang sudah dimodifikasi
);

// --- ROUTE PUT (Update Business) ---
router.put(
    "/:id", 
    // Hanya perlu thumbnail_picture untuk update, yang lainnya di-handle terpisah
    upload.fields([
        { name: 'thumbnail_picture', maxCount: 1 }, 
    ]),
    updateBusiness // Memanggil fungsi updateBusiness
);

// --- ROUTE POST (Upload Media Tambahan) ---
router.post(
    "/:id/media", 
    upload.array("media_files", 50), // Bisa upload batch file ke galeri yang sudah ada
    uploadMedia
);

// --- ROUTE DELETE ---
router.delete("/:id", deleteBusiness);


export default router;