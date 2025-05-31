// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", // Ganti dengan URL backend Anda
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token ke header jika ada
// Ini akan berjalan di client-side
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Pastikan hanya berjalan di client
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opsional: Interceptor untuk response, misalnya menangani error 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      typeof window !== "undefined" &&
      error.response &&
      error.response.status === 401
    ) {
      // Jika token tidak valid atau expired, logout user
      console.log("Unauthorized access (401), logging out.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      // Tidak bisa menggunakan useAuth hook di sini secara langsung
      // Redirect paksa atau emit event yang didengarkan oleh AuthProvider
      window.location.href = "/login?session_expired=true";
    }
    return Promise.reject(error);
  }
);

export default api;
