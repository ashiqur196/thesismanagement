import { api } from "./api";

export const authService = {
  async login(data) {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return { success: false, message: err.message || "Login failed" };
    }
  },

  async register(data) {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return { success: false, message: err.message || "Registration failed" };
    }
  },
};