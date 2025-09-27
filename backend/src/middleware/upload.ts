// backend/src/middleware/upload.ts

import multer from "multer";
import path from "path";

// Atur tempat simpan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // folder penyimpanan
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
    });

    // Filter file (hanya gambar)
    const fileFilter = (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image and video files are allowed!"), false);
        }
    };

export const upload = multer({ storage, fileFilter });
