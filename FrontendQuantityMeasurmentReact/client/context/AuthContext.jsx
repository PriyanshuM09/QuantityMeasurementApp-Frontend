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

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem("auth_token", data.token);
    }

    const userData = {
      email,
      name: email.split("@")[0],
    };

    setUser(userData);
    localStorage.setItem("auth_user", JSON.stringify(userData));
  };

  const signup = async (name, email, password) => {
    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    // Register the user (returns a plain string message)
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Auto-login after successful registration
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem("auth_token", data.token);
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
