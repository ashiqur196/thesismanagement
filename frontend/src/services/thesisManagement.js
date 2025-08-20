import { api } from "./api";

export const thesisManagementService = {
  async getMyThesis(query = {}) {
    try {
      const response = await api.get("/thesis/mythesis", {
        params: query
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch thesis",
      };
    }
  },
  async createThesis(data) {
    try {
      const response = await api.post("/thesis/create", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to create thesis",
      };
    }
  },
  async joinThesis(data) {
    try {
      const response = await api.post("/thesis/join", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to join thesis",
      };
    }
  },
  async getThesisbyId(thesisId) {
    try {
      const response = await api.get(`/thesis/view/${thesisId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch thesis",
      };
    }
  },
  async editThesis(thesisId, data) {
    try {
      const response = await api.put(`/thesis/edit/${thesisId}`, data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to update thesis",
      };
    }
  },
  async changeThesisPassword(thesisId, passwordData) {
    try {
      const response = await api.put(`/thesis/change-password/${thesisId}`, passwordData);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to change password",
      };
    }
  },
  async updateThesisStatus(thesisId, status) {
    try {
      const response = await api.put(`/thesis/update-status/${thesisId}`, { status });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to update status",
      };
    }
  },
  async deleteThesis(thesisId) {
    try {
      const response = await api.delete(`/thesis/delete/${thesisId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to delete thesis",
      };
    }
  },
  async getThesisMembers(thesisId) {
    try {
      const response = await api.get(`/thesis/members/${thesisId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch members",
      };
    }
  },
  async addThesisMember(thesisId, memberData) {
    try {
      const response = await api.post(`/thesis/members/${thesisId}`, memberData);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to add member",
      };
    }
  },
  async removeThesisMember(thesisId, memberId) {
    try {
      const response = await api.delete(`/thesis/members/${thesisId}/${memberId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to remove member",
      };
    }
  }
};