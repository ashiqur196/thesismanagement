import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setCurrentUser({
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (loginData) => {
    try {
      const response = await authService.login(loginData);

      if (response.success && response.token) {
        const authToken = response.token;
        const decoded = jwtDecode(authToken);

        const userInfo = {
          id: decoded.userId,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        };

        setCurrentUser(userInfo);
        localStorage.setItem("token", authToken);

        return { success: true, user: userInfo };
      } else {
        return {
          success: false,
          message: response.message || "Login failed",
        };
      }
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  };

  const register = async (registerData) => {
    try {
      const response = await authService.register(registerData);

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || "Registration failed",
        };
      }
    } catch (err) {
      console.error("Registration error:", err);
      return {
        success: false,
        message: "An unexpected error occurred",
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
  return useContext(AuthContext);
}
