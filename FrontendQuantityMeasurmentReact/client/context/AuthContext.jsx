import React, { createContext, useContext, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const data = await apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.accessToken) {
      localStorage.setItem("auth_token", data.accessToken);
    }

    const userData = {
      email,
      name: email.split("@")[0], // Assuming backend doesn't return name in login response
    };

    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    // Backend regex: "^(?=.*[A-Z])(?=.*[@#$%^&*()+\\-=])(?=.*[0-9]).{8,}$"
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&*()+\-=])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error("Password must be at least 8 chars, 1 uppercase, 1 number, and 1 special char (@#$%^&*()-+=)");
    }

    const data = await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (data.accessToken) {
      localStorage.setItem("auth_token", data.accessToken);
    }

    const userData = {
      email,
      name,
    };

    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
