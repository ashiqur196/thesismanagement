import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { authService } from "../services/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
    try {
      const response = await authService.checkToken();
      if (response.success) {
        setCurrentUser(response.user); // Use the user data from the response
        return true;
      }
      return false;
    } catch (err) {
      console.error("Token validation failed:", err);
      localStorage.removeItem("token");
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        await validateToken();
      }
      setLoading(false);
    };

    initializeAuth();
  }, [validateToken]);

  const login = async (loginData) => {
    try {
      const response = await authService.login(loginData);

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        setCurrentUser(response.user); // Use the user data from the response
        return {
          success: true,
          user: response.user,
        };
      }
      return {
        success: false,
        message: response.message || "Login failed",
      };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.message || "An unexpected error occurred",
      };
    }
  };

  const register = async (registerData) => {
    try {
      const response = await authService.register(registerData);
      if (!response.success) {
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }
      return { success: true };
    } catch (err) {
      console.error("Registration error:", err);
      return {
        success: false,
        message: err.message || "An unexpected error occurred",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
