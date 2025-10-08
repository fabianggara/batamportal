// backend/src/routes/businesses/routes.ts

import express from "express";
import {
    getAllBusinesses,
    getRelatedBusinesses,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
} from "@/controllers/businessesDataController";
import { upload } from "@/middleware/upload";

const router = express.Router();

// Konfigurasi fields untuk multer
const MAX_ROOM_PHOTOS = 50;
const roomPhotoFields = [];
for (let i = 0; i < MAX_ROOM_PHOTOS; i++) {
    roomPhotoFields.push({ name: `room_photo_${i}`, maxCount: 1 });
}

const businessMediaFields = [
    { name: 'thumbnail_picture', maxCount: 1 },
    { name: 'media_files', maxCount: 30 },
    ...roomPhotoFields,
];

// --- ROUTES ---

// GET routes
router.get("/related", getRelatedBusinesses);
router.get("/:id", getBusinessById);
router.get("/", getAllBusinesses);

// POST create business
router.post(
    "/",
    upload.fields(businessMediaFields),
    createBusiness
);

// PUT update business
router.put(
    "/:id",
    upload.fields(businessMediaFields),
    updateBusiness
);

// DELETE business
router.delete("/:id", deleteBusiness);

export default router;



// import express from "express";
// import {
//     getAllBusinesses,
//     getRelatedBusinesses,
//     getBusinessById, 
//     createBusiness,    
//     uploadMedia,
//     updateBusiness,    
//     deleteBusiness,
//     deleteRoomPhoto, // 🔥 BARU
// } from "@/controllers/businessesDataController";
// import { upload } from "@/middleware/upload";

// const router = express.Router();

// // --- Konfigurasi Multer untuk Foto Kamar ---
// const MAX_ROOM_PHOTOS = 20; // Naikkan sesuai kebutuhan
// const roomPhotoFields = [];
// for (let i = 0; i < MAX_ROOM_PHOTOS; i++) {
//     roomPhotoFields.push({ name: `room_photo_${i}`, maxCount: 1 });
// }

// const businessMediaFields = [
//     { name: 'thumbnail_picture', maxCount: 1 },
//     { name: 'media_files', maxCount: 20 },
//     ...roomPhotoFields,
// ];

// // --- ROUTE GET ---
// router.get("/related", getRelatedBusinesses);
// router.get("/", getAllBusinesses);
// router.get("/:id", getBusinessById);

// // --- ROUTE POST (Create Business) ---
// router.post(
//     "/", 
//     upload.fields(businessMediaFields as any),
//     createBusiness 
// );

// // --- ROUTE PUT (Update Business) ---
// router.put(
//     "/:id", 
//     upload.fields(businessMediaFields as any),
//     updateBusiness 
// );

// // --- ROUTE POST (Upload Media Tambahan) ---
// router.post(
//     "/:id/media", 
//     upload.array("media_files", 50),
//     uploadMedia
// );

// // --- ROUTE DELETE Business ---
// router.delete("/:id", deleteBusiness);

// // 🔥 ROUTE DELETE Room Photo (BARU)
// router.delete("/rooms/:roomId/photo", deleteRoomPhoto);

// export default router;