// src/types.ts
import { JwtPayload } from 'jsonwebtoken';

// Definisikan tipe spesifik untuk payload token Anda
export interface CustomJwtPayload extends JwtPayload {
    userId: number;
    email: string;
    role: string;
}

// Gunakan 'declare global' untuk memperluas tipe bawaan Express
declare global {
  namespace Express {
    export interface Request {
      user?: CustomJwtPayload; // Tambahkan properti 'user' ke Request
    }
  }
}