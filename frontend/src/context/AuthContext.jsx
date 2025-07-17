import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id:
          "149835755959-hkqddo6a2ohrjq2ie29mf5ac5j6i5q69.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
    }
  }, []);

  useEffect(() => {
    if (user && user.email.endsWith("@iiti.ac.in")) {
      const name = extractName(user.email);
      const branch = extractBranch(user.email);

      axios.post("/login", {
        name,
        email: user.email,
        branch,
      });

      // Send chat history to backend
      const localChats = JSON.parse(localStorage.getItem("chats")) || [];
      axios.post("/chat-history", { chats: localChats });

      // Get latest chat history
      axios.get("/chat-history").then((res) => {
        localStorage.setItem("chats", JSON.stringify(res.data.chats));
      });
    }
  }, [user]);

  const handleCredentialResponse = (response) => {
    const decoded = jwt_decode(response.credential);
    if (decoded.email.endsWith("@iiti.ac.in")) {
      setUser({
        name: decoded.name,
        email: decoded.email,
      });
      setIsLoggedIn(true);
    } else {
      alert("Only IIT Indore users are allowed.");
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("chats");
    localStorage.removeItem("selectedChatId");
  };

  const extractName = (email) => {
    const roll = email.split("@")[0];
    const match = roll.match(/([a-z]{2})(\d{2})/);
    return match ? match[1].toUpperCase() + " " + match[2] : roll;
  };

  const extractBranch = (email) => {
    const roll = email.split("@")[0];
    const match = roll.match(/[a-z]{2}\d{2}(\d{3})/);
    return match ? match[1] : "Unknown";
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
