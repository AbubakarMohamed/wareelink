import ApiService from "@/Services/ApiService";

const AuthService = {
  login(data) {
    return ApiService.post("/login", data); 
  },

  register(data) {
    return ApiService.post("/register", data);
  },

  logout() {
    return ApiService.post("/logout");
  },

  getUser() {
    return ApiService.get("/user");
  },
};

export default AuthService;