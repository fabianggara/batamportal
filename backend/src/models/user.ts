// src/models/User.ts
export interface User {
    id: number;
    email: string;
    password: string; // Sebaiknya jangan kirim ini ke frontend
    role: string;
    name?: string;
    reset_token?: string | null;
    reset_token_expiry?: number | null;
}