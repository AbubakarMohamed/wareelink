import axios from "@/bootstrap";
import { router } from "@inertiajs/react";

// ----------------------------
// 🔹 Base ApiService methods
// ----------------------------
const ApiService = {
  get(resource, params = {}) {
    return axios.get(resource, { params });
  },

  post(resource, data, config = {}) {
    return axios.post(resource, data, config);
  },

  put(resource, data, config = {}) {
    return axios.put(resource, data, config);
  },

  patch(resource, data, config = {}) {
    return axios.patch(resource, data, config);
  },

  delete(resource, config = {}) {
    return axios.delete(resource, config);
  },
};

// ----------------------------
// 🔹 Global Axios Interceptors
// ----------------------------

// ✅ Request Interceptor → ensures CSRF token is always available
axios.interceptors.request.use(
  async (config) => {
    // If it's a state-changing request, make sure CSRF cookie is set
    if (["post", "put", "patch", "delete"].includes(config.method)) {
      await axios.get("/sanctum/csrf-cookie");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor → handle auth/session errors
axios.interceptors.response.use(
  (response) => response, // success passthrough
  async (error) => {
    const { response } = error;

    if (!response) {
      console.error("🌐 Network/Server error:", error);
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401: // Unauthorized → redirect to login
        console.warn("🔒 Unauthorized. Redirecting to login...");
        router.visit(route("login"));
        break;

      case 419: // CSRF token expired → refresh and retry
        console.warn("🔄 CSRF token expired. Refreshing...");
        try {
          await axios.get("/sanctum/csrf-cookie"); // refresh CSRF
          return axios.request(error.config); // retry original request
        } catch (csrfError) {
          console.error("❌ Failed to refresh CSRF token:", csrfError);
          return Promise.reject(csrfError);
        }

      default: // Other errors
        console.error("⚠️ API Error:", response.status, response.data);
        break;
    }

    return Promise.reject(error);
  }
);

export default ApiService;
