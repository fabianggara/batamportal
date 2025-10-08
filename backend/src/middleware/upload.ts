// backend/src/middleware/upload.ts

import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

// Filter file (gambar dan video)
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}. Only images and videos are accepted.`), false);
    }
};

// Limits
const limits = {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 50 // Max 50 files per request
};

export const upload = multer({ 
    storage, 
    fileFilter,
    limits 
});


// import multer from "multer";
// import path from "path";

// // Atur tempat simpan file
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // folder penyimpanan
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     },
//     });

//     // Filter file (hanya gambar)
//     const fileFilter = (req: any, file: any, cb: any) => {
//         if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
//             cb(null, true);
//         } else {
//             cb(new Error("Only image and video files are allowed!"), false);
//         }
//     };

// export const upload = multer({ storage, fileFilter });
