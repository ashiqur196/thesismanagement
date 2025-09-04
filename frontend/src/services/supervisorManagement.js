import { api } from "./api";

export const supervisorManagementService = {
  async getSupervisor(query = {}) {
    try {
      const response = await api.get("/faculty", {
        params: query,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch supervisors",
      };
    }
  },
  async getSupervisorbyId(id) {
    try {
      const response = await api.get(`/faculty/view/${id}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch supervisors",
      };
    }
  },
  async getRequests() {
    try {
      const response = await api.get("/faculty/requests");
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch thesis supervision requests",
      };
    }
  },
  async acceptRequest(requestId) {
    try {
      const response = await api.patch(
        `thesis/update-supervisor-request/${requestId}`,
        {
          status: "ACCEPTED",
        }
      );
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to accept supervision request",
      };
    }
  },

  async rejectRequest(requestId) {
    try {
      const response = await api.patch(
        `thesis/update-supervisor-request/${requestId}`,
        {
          status: "REJECTED",
        }
      );
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to reject supervision request",
      };
    }
  },

  async getActiveTheses(query = {}) {
    try {
      const response = await api.get("/faculty/active-theses", {
        params: query,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch active theses",
      };
    }
  },

  async getCompletedTheses(query = {}) {
    try {
      const response = await api.get("/faculty/completed-theses", {
        params: query,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch completed theses",
      };
    }
  },
};
