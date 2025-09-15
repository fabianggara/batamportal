// frontend/src/lib/api.ts
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL,
    withCredentials: true, // kalau server pakai cookie-based auth
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000,
});

// Interceptor umum: attach token (jika simpan di localStorage), handle errors, refresh token, dsb.
api.interceptors.request.use((config) => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {}
    return config;
});

// Response interceptor (opsional)
api.interceptors.response.use(
    (res) => res,
    (error) => {
        // contoh: jika 401 -> redirect ke login atau try refresh token
        return Promise.reject(error);
    }
);

export default api;
