import ApiService from "@/Services/ApiService";

/**
 * AuthService handles login, registration, logout, and user fetch
 * Returns role-based redirect URLs to let frontend handle routing
 */
const AuthService = {
  /**
   * Map role to correct dashboard URL
   */
  getRedirectUrl(role) {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "company":
        return "/company/dashboard";
      case "shop":
        return "/shop/dashboard";
      case "warehouse_admin":
        return "/warehouse/dashboard";
      default:
        return "/dashboard";
    }
  },

  /**
   * Login user and return user info + role-based redirect URL
   */
  async login(data) {
    const response = await ApiService.post("/login", data, {
      headers: { Accept: "application/json" },
    });

    const user = response.data.user;

    return {
      user,
      redirect_url: this.getRedirectUrl(user.role),
    };
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

      return {
        user,
        redirect_url: this.getRedirectUrl(user.role),
        response,
      };
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
