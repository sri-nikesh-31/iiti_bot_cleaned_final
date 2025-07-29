// src/components/Layout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userEmail } = useAuth();
  const unloadRef = useRef(false);

  const [chats, setChats] = useState(() => {
    const stored = localStorage.getItem("chatList");
    return stored ? JSON.parse(stored) : [];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem("activeChatId") || null;
  });

  const [chatMessages, setChatMessages] = useState(() => {
    const stored = localStorage.getItem("chatMessages");
    return stored ? JSON.parse(stored) : {};
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("chatList", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("activeChatId", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Fetch chat history from backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`/chat-history?userId=${userEmail}`);
        const data = await res.json();
        const { chats: backendChats = [], chatMessages: messagesFromBackend = {} } = data;

        setChats(backendChats.reverse());
        setChatMessages(messagesFromBackend);

        if (backendChats.length > 0) {
          setActiveChatId(backendChats[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    if (isLoggedIn) fetchChats();
  }, [isLoggedIn, userEmail]);

  // Warn and clear chats on window close only for guests
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isLoggedIn && !unloadRef.current) {
        unloadRef.current = true;
        localStorage.removeItem("chatList");
        localStorage.removeItem("chatMessages");
        localStorage.removeItem("activeChatId");
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Chats will be lost.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn]);

  const generateUniqueTitle = () => {
    let index = 1;
    let title;
    do {
      title = `New chat ${index++}`;
    } while (chats.some((chat) => chat.title === title));
    return title;
  };

  const handleNewChat = () => {
    const id = uuidv4();
    const newChat = { id, title: generateUniqueTitle() };
    const updatedChats = [newChat, ...chats];
    const updatedMessages = { ...chatMessages, [id]: [] };

    setChats(updatedChats);
    setActiveChatId(id);
    setChatMessages(updatedMessages);
    navigate("/chatbot");
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    navigate("/chatbot");
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(chats.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));
  };

  const handleDeleteChat = (id) => {
    const filteredChats = chats.filter((chat) => chat.id !== id);
    const updatedMessages = { ...chatMessages };
    delete updatedMessages[id];

    setChats(filteredChats);
    setChatMessages(updatedMessages);

    if (filteredChats.length > 0) {
      setActiveChatId(filteredChats[0].id);
    } else {
      const newId = uuidv4();
      const newChat = { id: newId, title: generateUniqueTitle() };
      setChats([newChat]);
      setActiveChatId(newId);
      setChatMessages({ [newId]: [] });
    }
  };

  const handleFirstUserMessage = (messageText) => {
    const id = uuidv4();
    const newChat = { id, title: generateUniqueTitle() };
    const newMessages = [{ sender: "user", text: messageText }];
    const updatedChats = [newChat, ...chats];

    setChats(updatedChats);
    setActiveChatId(id);
    setChatMessages((prev) => ({ ...prev, [id]: newMessages }));
    return id;
  };

  // Handle homepage "Get Started"
  useEffect(() => {
    if (location.state?.createNewChat) {
      handleNewChat();
      navigate("/chatbot", { replace: true, state: {} });
    }
  }, [location]);

  return (
    <div className="flex min-h-screen">
      {!sidebarCollapsed && (
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          onToggleCollapse={() => setSidebarCollapsed(true)}
        />
      )}
      {sidebarCollapsed && (
        <div className="w-10 bg-[#1b0d3a] text-white flex items-center justify-center">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="text-white hover:text-purple-400"
            title="Expand Sidebar"
          >
            &gt;&gt;
          </button>
        </div>
      )}
      <div className="flex-grow">
        <Outlet
          context={{
            chats,
            chatMessages,
            activeChatId,
            setActiveChatId,
            setChatMessages,
            handleFirstUserMessage,
            handleNewChat,
          }}
        />
      </div>
    </div>
  );
}
