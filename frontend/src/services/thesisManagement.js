import { api } from "./api";

export const thesisManagementService = {
  async getMyThesis(query = {}) {
    try {
      const response = await api.get("/thesis/mythesis", {
        params: query,
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
  async getMyThesisNoSupervisor() {
    try {
      const response = await api.get("/thesis/mythesis/nosupervisor");
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
  async getThesisbyIdPublic(thesisId) {
    try {
      const response = await api.get(`/thesis/view-public/${thesisId}`);
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
      const response = await api.put(
        `/thesis/change-password/${thesisId}`,
        passwordData
      );
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
      const response = await api.put(`/thesis/update-status/${thesisId}`, {
        status,
      });
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
      const response = await api.post(
        `/thesis/add-member/${thesisId}`,
        memberData
      );
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
  async removeThesisMember(data) {
    try {
      const response = await api.post("/thesis/remove-member", data);
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
  },
  async requestSupervisor(data) {
    try {
      const response = await api.post("/thesis/request-supervisor", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to create request",
      };
    }
  },
  async getRequests(thesisId) {
    try {
      const response = await api.get(`/thesis/supervisor-requests/${thesisId}`);
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
  async deleteRequest(requestId) {
    try {
      const response = await api.patch(
        `thesis/update-supervisor-request/${requestId}`,
        {
          status: "DELETED",
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

  async getTaskStats(thesisId) {
    try {
      const response = await api.get(`/thesis/task-stats/${thesisId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch task stats",
      };
    }
  },
  async createTask(data) {
    try {
      const response = await api.post("/thesis/tasks", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to create task",
      };
    }
  },
  async editTask(taskId, data) {
    try {
      const response = await api.put(`/thesis/tasks/${taskId}`, data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to edit task",
      };
    }
  },
  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/thesis/tasks/${taskId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to delete task",
      };
    }
  },
  async getTasks(query, theisId) {
    try {
      const response = await api.get(`/thesis/tasks/${theisId}`, {
        params: query,
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch tasks",
      };
    }
  },
  async postSubmission(data) {
    try {
      const response = await api.post("/thesis/submissions", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Submission failed.",
      };
    }
  },
  async provideFeedback(submissionId, data) {
    try {
      const response = await api.put(
        `/thesis/submissions/feedback/${submissionId}`,
        data
      );
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to provide feedback",
      };
    }
  },
  async getAppointments(thesisId) {
    try {
      const response = await api.get(`/thesis/appointments/${thesisId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to fetch appointments",
      };
    }
  },

  async createAppointment(data) {
    try {
      const response = await api.post("/thesis/appointment", data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to create appointment",
      };
    }
  },

  async updateAppointment(appointmentId, data) {
    try {
      const response = await api.put(`/thesis/appointment/${appointmentId}`, data);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to update appointment",
      };
    }
  },

  async deleteAppointment(appointmentId) {
    try {
      const response = await api.delete(`/thesis/appointment/${appointmentId}`);
      return response.data;
    } catch (err) {
      if (err.response && err.response.data) {
        return err.response.data;
      }
      return {
        success: false,
        message: err.message || "Failed to delete appointment",
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
        message: err.message || "Failed to delete Thesis",
      };
    }
  },
};
