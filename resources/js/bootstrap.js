import axios from "axios";

// Create axios instance
const ApiService = axios.create({
    baseURL: "/", // 👈 all requests go to Laravel backend root
    withCredentials: true, // 👈 needed if using Sanctum/session auth
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Optional: CSRF token setup (important for Laravel POST requests)
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    ApiService.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
} else {
    console.error("CSRF token not found: make sure you have <meta name=\"csrf-token\"> in your <head>!");
}

// Make globally available if you want (not required)
window.axios = ApiService;

export default ApiService;
