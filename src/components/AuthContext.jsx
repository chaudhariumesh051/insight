import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("interviewUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem("interviewUsers");
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const login = (email, password) => {
    // Check if user exists and password matches
    const existingUser = users.find(u => u.email === email && u.password === password);
    if (existingUser) {
      const newUser = { email: existingUser.email, name: existingUser.name };
      localStorage.setItem("interviewUser", JSON.stringify(newUser));
      setUser(newUser);
      return { success: true };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const signup = (name, email, password) => {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: "User with this email already exists" };
    }

    // Create new user
    const newUser = { name, email, password };
    const updatedUsers = [...users, newUser];
    
    localStorage.setItem("interviewUsers", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Auto login after signup
    const userSession = { email, name };
    localStorage.setItem("interviewUser", JSON.stringify(userSession));
    setUser(userSession);
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("interviewUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);