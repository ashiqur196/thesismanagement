import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { thesisManagementService } from "../services/thesisManagement";

export const ThesisContext = createContext();

export function ThesisProvider({ children }) {
  const { thesisId } = useParams();
  const [thesis, setThesis] = useState(null); //{id,title, description, researchTags, code, joinPassword, status, createdAt}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getThesis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await thesisManagementService.getThesisbyId(thesisId);
      if (response.success) {
        setThesis(response.thesis);
        setError(null);
        return true;
      } else {
        setError(response.message || "Failed to fetch thesis");
        return false;
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  }, [thesisId]);

  useEffect(() => {
    if (thesisId) {
      getThesis();
    } else {
      setLoading(false);
    }
  }, [getThesis, thesisId]);

  const changePassword = async () => {
    try {
      const response = await thesisManagementService.changeThesisPassword(
        thesisId,
      );
      
      if (response.success) {
        setThesis(prev => ({ ...prev, joinPassword: response.newPassword }));
        setError(null);
        return {
          success: true,
          message: response.message || "Password changed successfully"
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to change password"
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "An unexpected error occurred"
      };
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      const response = await thesisManagementService.updateThesisStatus(
        thesisId,
        newStatus
      );
      
      if (response.success) {
        setThesis(prev => ({ ...prev, status: newStatus }));
        setError(null);
        return {
          success: true,
          message: response.message || "Status updated successfully"
        };
      } else {
        setError(response.message || "Failed to update status");
        return {
          success: false,
          message: response.message || "Failed to update status"
        };
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      return {
        success: false,
        message: err.message || "An unexpected error occurred"
      };
    } finally {
      setLoading(false);
    }
  };

  const editThesis = async (data) => {
    try {
      const response = await thesisManagementService.editThesis(thesisId, data);
      
      if (response.success) {
        setThesis(prev => ({ ...prev, ...data }));
        setError(null);
        return {
          success: true,
          message: response.message || "Thesis updated successfully"
        };
      } else {
        return {
          success: false,
          message: response.message || "Failed to update thesis"
        };
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || "An unexpected error occurred"
      };
    }
  };

  const refreshThesis = async () => {
    return await getThesis();
  };

  const value = {
    thesis,
    loading,
    error,
    editThesis,
    changePassword,
    updateStatus,
    refreshThesis,
  };

  return (
    <ThesisContext.Provider value={value}>
      {!loading && children}
    </ThesisContext.Provider>
  );
}

export function useThesis() {
  const context = useContext(ThesisContext);
  if (!context) {
    throw new Error("useThesis must be used within a ThesisProvider");
  }
  return context;
}