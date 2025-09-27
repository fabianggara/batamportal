// backend/src/routes/submissions/routes.ts
import express from "express";
import {
    getAllSubmissions,
    getSubmissionById,
    createSubmission,
    uploadMedia,
    updateSubmission,
    deleteSubmission,
} from "@/controllers/locationDataController";
import { upload } from "@/middleware/upload"; // <--- IMPORT upload

const router = express.Router();

router.get("/", getAllSubmissions);
router.get("/:id", getSubmissionById);
// router.post("/", upload.single("thumbnail_picture"), createSubmission); // pakai upload
// router.put("/:id", upload.single("thumbnail_picture"), updateSubmission); // update juga kalau bisa ganti gambar
router.delete("/:id", deleteSubmission);
router.post(
    "/", 
    upload.fields([
        { name: 'thumbnail_picture', maxCount: 1 },
        { name: 'media_files', maxCount: 10 } // Batasi jumlah file jika perlu
    ]),
    createSubmission  
);
router.put(
    "/:id", 
    upload.fields([
        { name: 'thumbnail_picture', maxCount: 1 },
    ]),
    updateSubmission
);

router.post(
    "/:id/media", 
    upload.array("media_files", 10), 
    uploadMedia
);


export default router;
