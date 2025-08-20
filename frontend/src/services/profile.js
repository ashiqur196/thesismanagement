import { api } from "./api";

export const profileService = {
  async getProfile() {
    try {
      const response = await api.get("/account/profile");
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch profile",
      };
    }
  },

  async updateProfile(data) {
    try {
      const response = await api.put("/account/profile", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Profile update failed",
      };
    }
  },

  async updatePassword(data) {
    try {
      const response = await api.put("/account/profile/password", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Password update failed",
      };
    }
  },

  async getContributions(userId) {
    try {
      const response = await api.get("/account/contributions", {
        params: {
          id: userId,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch contributions",
      };
    }
  },
  async updateContribution(data) {
    try {
      const response = await api.put("/account/contributions", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to update contribution",
      };
    }
  },
  async deleteContribution(id) {
    try {
      const response = await api.delete("/account/contributions",{
        params:{
          id
        }
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to delete contribution",
      };
    }
  },
  async addContribution(data) {
    try {
      const response = await api.post("/account/contributions", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to add contribution",
      };
    }
  },
};
