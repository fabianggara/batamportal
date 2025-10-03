import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// Anggap Anda sudah punya tipe kustom ini dari pembahasan kita sebelumnya
import { CustomJwtPayload } from '../types'; 

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.session_token;
        if (!token) {
            // Cukup kirim respons, tidak perlu 'return'
            res.status(401).json({ error: "Akses ditolak. Silakan login." });
            return; // Tambahkan return kosong untuk kejelasan
        }

        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
        req.user = decoded; 

        next(); // Lanjutkan ke controller jika token valid
    } catch (error) {
        // Cukup kirim respons, tidak perlu 'return'
        res.status(401).json({ error: "Token tidak valid atau sudah kedaluwarsa." });
    }
};