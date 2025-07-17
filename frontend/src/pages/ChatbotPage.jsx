import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOutletContext } from "react-router-dom";

const ChatMessage = ({ sender, text }) => {
  const isProcessing = text === "Processing your query...";
  if (sender === "bot" && isProcessing) {
    return (
      <div className="self-start text-white text-sm md:text-base mb-4">
        {text}
      </div>
    );
  }

  return (
    <div
      className={`${
        sender === "user"
          ? "self-end border-purple-500 bg-[#2c1850]"
          : "self-start bg-[#1f1036] border-purple-700"
      } border rounded-2xl px-5 py-3 max-w-[90%] text-white text-sm md:text-base leading-relaxed mb-4 break-words`}
    >
      {text}
    </div>
  );
};

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const chatContainerRef = useRef(null);

  const { isLoggedIn, userId } = useAuth();
  const {
    activeChatId: activeChat,
    setChatMessages,
    chatMessages,
    handleFirstUserMessage,
  } = useOutletContext();

  const messages = chatMessages[activeChat] || [];

  // 🔁 Fetch chat history from backend after login
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/getChatHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userId }),
        });
        const data = await res.json();
        if (data.success) {
          setChatMessages(data.chats || {});
        }
      } catch (err) {
        console.error("❌ Failed to fetch chats:", err);
      }
    };

    if (isLoggedIn && userId) {
      fetchChatHistory();
    }
  }, [isLoggedIn, userId]);

  // ⏺ Save chat history to backend when chatMessages update
  useEffect(() => {
    const syncChats = async () => {
      if (!isLoggedIn || !userId) return;
      try {
        await fetch("http://localhost:3000/api/saveChatHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userId, chats: chatMessages }),
        });
      } catch (err) {
        console.error("❌ Failed to save chats:", err);
      }
    };

    syncChats();
  }, [chatMessages, isLoggedIn, userId]);

  useEffect(() => {
    if (chatMessages[activeChat]?.length > 0) {
      setStarted(true);
    }
  }, [activeChat, chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input.trim() };
    const botMessage = { sender: "bot", text: "Processing your query..." };

    if (!activeChat) {
      handleFirstUserMessage(input.trim());
      setInput("");
      setStarted(true);
      return;
    }

    const updatedMessages = [
      ...(chatMessages[activeChat] || []),
      userMessage,
      botMessage,
    ];

    setChatMessages((prev) => ({
      ...prev,
      [activeChat]: updatedMessages,
    }));

    setInput("");
    setStarted(true);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`min-h-screen text-white overflow-hidden flex flex-col transition-all duration-1000 ease-in-out ${
        started ? "bg-gradient-to-br" : ""
      }`}
      style={{
        background: started
          ? "radial-gradient(ellipse 50% 50% at 50% 10%, #371F5A, #371F5A, #11071F)"
          : "radial-gradient(ellipse 40% 40% at 50% 65%, #371F5A, #371F5A, #11071F)",
        transition: "background 8s ease-out",
      }}
    >
      {!started ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-20 transition-all duration-3000 ease-in-out">
          <h2 className="mb-3 text-lg font-medium tracking-widest text-gray-300 md:text-xl">
            EXPLORE <span className="font-bold text-white">IIT INDORE</span>
          </h2>
          <p className="max-w-2xl text-sm md:text-base text-gray-400 leading-relaxed mb-8">
            Engage With Our AI Chatbot To Answer Any Query Related To
            Curriculum, Management, Staff And More In IIT Indore
          </p>
          <div className="flex w-full mt-22 max-w-2xl items-center rounded-full border border-purple-500 px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500">
            <input
              type="text"
              placeholder="Message Chatbot.."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-grow bg-transparent px-2 text-sm text-white placeholder-gray-400 focus:outline-none md:text-base"
            />
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 transition hover:bg-purple-600 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col pt-16 flex-grow max-h-screen overflow-hidden">
          <div
            className="flex-grow overflow-y-auto px-4 py-6 flex flex-col items-center no-scrollbar"
            ref={chatContainerRef}
          >
            <div className="w-full max-w-3xl flex flex-col">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} sender={msg.sender} text={msg.text} />
              ))}
            </div>
          </div>

          <div className="border-t border-transparent py-3 px-4 bg-gradient-to-t from-[#03000d] to-transparent">
            <div className="flex w-full max-w-3xl mx-auto items-center rounded-full border border-purple-500 px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500 backdrop-blur-md">
              <textarea
                placeholder="Message Chatbot.."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                className="flex-grow bg-transparent px-2 text-sm text-white placeholder-gray-400 focus:outline-none md:text-base resize-none overflow-y-auto"
                style={{ minHeight: "25px", maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  input.trim()
                    ? "bg-purple-600 text-white hover:opacity-80"
                    : "bg-white text-purple-600 cursor-not-allowed"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
