import ApiService from "@/Services/ApiService";

/**
 * AuthService handles login, registration, logout, and user fetch
 * Returns role-based redirect URLs to let frontend handle routing
 */
const AuthService = {
  /**
   * Login user and return user info + role-based redirect URL
   */
  async login(data) {
    // Perform login and get user + role in one response
    const response = await ApiService.post("/login", data, {
      headers: { Accept: "application/json" },
    });

    const user = response.data.user;

    // Determine role-based redirect URL
    let redirect_url = "/dashboard"; // fallback
    switch (user.role) {
      case "admin":
        redirect_url = "/admin/dashboard";
        break;
      case "company":
        redirect_url = "/company/dashboard";
        break;
      case "shop":
        redirect_url = "/shop/dashboard";
        break;
      case "warehouse_admin":
        redirect_url = "/warehouse/dashboard";
        break;
    }

    // Return user info and redirect URL to frontend
    return { user, redirect_url };
  },

  /**
   * Register user and return user info + role-based redirect URL
   */
  async register(data) {
    const response = await ApiService.post("/register", data, {
      headers: { Accept: "application/json" },
    });

    if (response.data.user) {
      const user = response.data.user;

      // Determine role-based redirect URL
      let redirect_url = "/dashboard"; // fallback
      switch (user.role) {
        case "admin":
          redirect_url = "/admin/dashboard";
          break;
        case "company":
          redirect_url = "/company/dashboard";
          break;
        case "shop":
          redirect_url = "/shop/dashboard";
          break;
        case "warehouse_admin":
          redirect_url = "/warehouse/dashboard";
          break;
      }

      // Return user and redirect info to frontend
      return { user, redirect_url, response };
    }

    return response;
  },

  /**
   * Logout user and return redirect URL
   */
  async logout() {
    await ApiService.post("/logout", null, {
      headers: { Accept: "application/json" },
    });

    // Return redirect URL so frontend can navigate
    return { redirect_url: "/login" };
  },

  /**
   * Fetch authenticated user
   */
  async getUser() {
    const { data } = await ApiService.get("/user", {
      headers: { Accept: "application/json" },
    });
    return data;
  },
};

export default AuthService;
