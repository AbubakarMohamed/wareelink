import ApiService from "@/Services/ApiService";

/**
 * AuthService handles login, registration, logout, and user fetch
 * Returns role-based redirect URLs and allowed paths
 */
const AuthService = {
  /**
   * Map role to default dashboard + allowed paths
   */
  getRoleConfig(role) {
    switch (role) {
      case "admin":
        return {
          redirect: "/admin/dashboard",
          allowed: ["/admin/dashboard"],
        };
      case "company":
        return {
          redirect: "/company/dashboard",
          allowed: [
            "/company/dashboard",
            "/company/products",
            "/company/products/create",
          ],
        };
      case "shop":
        return {
          redirect: "/shop/dashboard",
          allowed: ["/shop/dashboard"],
        };
      case "warehouse_admin":
        return {
          redirect: "/warehouse/dashboard",
          allowed: ["/warehouse/dashboard"],
        };
      default:
        return {
          redirect: "/dashboard",
          allowed: ["/dashboard"],
        };
    }
  },

  /**
   * Login user and return user info + role config
   */
  async login(data) {
    const response = await ApiService.post("/login", data, {
      headers: { Accept: "application/json" },
    });

    const user = response.data.user;
    const roleConfig = this.getRoleConfig(user.role);

    return {
      user,
      redirect_url: roleConfig.redirect,
      allowed_paths: roleConfig.allowed,
    };
  },

  /**
   * Register user and return user info + role config
   */
  async register(data) {
    const response = await ApiService.post("/register", data, {
      headers: { Accept: "application/json" },
    });

    if (response.data.user) {
      const user = response.data.user;
      const roleConfig = this.getRoleConfig(user.role);

      return {
        user,
        redirect_url: roleConfig.redirect,
        allowed_paths: roleConfig.allowed,
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
