import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [chatList, setChatList] = useState([]);

  // 🔁 Fetch chat history from backend
  const fetchChatHistory = async (email) => {
    try {
      const res = await axios.get(`http://localhost:5000/chat-history?userId=${email}`);
      const chats = res.data.chats || {};

      const chatArray = Object.keys(chats).map((chatId) => ({
        id: chatId,
        title: chats[chatId][0]?.text?.slice(0, 20) || "New chat",
      }));

      setChatMessages(chats);
      setChatList(chatArray);

      localStorage.setItem("chatMessages", JSON.stringify(chats));
      localStorage.setItem("chatList", JSON.stringify(chatArray));
    } catch (err) {
      console.error("❌ Failed to fetch chat history:", err);
    }
  };

  // 💾 Sync chat history to backend per chat if logged in
  useEffect(() => {
    if (isLoggedIn && userId) {
      Object.entries(chatMessages).forEach(async ([chatId, messages]) => {
        try {
          await axios.post("http://localhost:5000/save_chat", {
            email: userId,
            chatId,
            messages,
          });
          console.log(`✅ Synced chat ${chatId}`);
        } catch (err) {
          console.error(`❌ Sync error for chat ${chatId}:`, err);
        }
      });
    }
  }, [chatMessages, isLoggedIn, userId]);

  // 🟡 On mount — load from localStorage if logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("userEmail");
    if (savedUser) {
      setIsLoggedIn(true);
      setUserId(savedUser);
      fetchChatHistory(savedUser);
    }
  }, []);

  // ❌ Logout
  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatList");
    setIsLoggedIn(false);
    setUserId(null);
    setChatMessages({});
    setChatList([]);
  };

  // ✅ Login using email
  const handleLogin = async (email) => {
    setIsLoggedIn(true);
    setUserId(email);
    localStorage.setItem("userEmail", email);

    // 🔁 Sync guest chats to backend
    const guestChats = localStorage.getItem("chatMessages");
    if (guestChats) {
      try {
        const parsedChats = JSON.parse(guestChats);
        for (const [chatId, messages] of Object.entries(parsedChats)) {
          await axios.post("http://localhost:5000/save_chat", {
            email,
            chatId,
            messages,
          });
        }
        console.log("✅ Guest chats synced to backend");
      } catch (error) {
        console.error("❌ Sync guest chats failed", error);
      }
    }

    await fetchChatHistory(email);

    // Clear guest chat data from localStorage
    Object.keys(localStorage)
      .filter((key) => key.startsWith("chats_") || key === "chatMessages")
      .forEach((key) => localStorage.removeItem(key));
  };

  // 🧹 Clear localStorage on window close if not logged in
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isLoggedIn) {
        Object.keys(localStorage)
          .filter((key) => key.startsWith("chats_") || key === "chatMessages" || key === "chatList")
          .forEach((key) => localStorage.removeItem(key));
        const confirmationMessage = "You will lose your chats if you leave. Continue?";
        e.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        setIsLoggedIn,
        setUserId,
        chatMessages,
        setChatMessages,
        chatList,
        setChatList,
        handleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
