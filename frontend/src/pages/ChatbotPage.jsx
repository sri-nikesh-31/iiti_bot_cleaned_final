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

  // ✅ Updated: Fetch chat history from backend format (list of lists)
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/getChatHistory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userId }),
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.chats) && Array.isArray(data.chatIds)) {
          const reconstructed = {};

          for (let i = 0; i < data.chatIds.length; i++) {
            const chatId = data.chatIds[i];
            const rawMessages = data.chats[i];

            reconstructed[chatId] = rawMessages.map((msg) => ({
              sender: msg.role === "assistant" ? "bot" : "user",
              text: msg.content,
            }));
          }

          setChatMessages(reconstructed);
        }
      } catch (err) {
        console.error("❌ Failed to fetch chats:", err);
      }
    };

    if (isLoggedIn && userId) {
      fetchChatHistory();
    }
  }, [isLoggedIn, userId]);

  // Save chats when updated
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

  // Mark session as started
  useEffect(() => {
    if (chatMessages[activeChat]?.length > 0) {
      setStarted(true);
    }
  }, [activeChat, chatMessages]);

  // Clean up on window close if not logged in
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isLoggedIn) {
        localStorage.removeItem("chatList");
        localStorage.removeItem("chatMessages");
        e.preventDefault();
        e.returnValue = "Your chats will be lost unless you log in.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoggedIn]);

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

    fetch("http://localhost:3000/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: activeChat,
        userId,
        message: input.trim(),
      }),
    }).then(async (res) => {
      const data = await res.json();
      const updated = updatedMessages.slice(0, -1); // Remove "processing..."
      updated.push({ sender: "bot", text: data.reply || "No response." });

      setChatMessages((prev) => ({
        ...prev,
        [activeChat]: updated,
      }));
    });

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
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-20">
          <h2 className="mb-3 text-lg font-medium tracking-widest text-gray-300 md:text-xl">
            EXPLORE <span className="font-bold text-white">IIT INDORE</span>
          </h2>
          <p className="max-w-2xl text-sm md:text-base text-gray-400 mb-8">
            Engage with our AI chatbot for queries about curriculum, staff,
            management and more.
          </p>
          <div className="flex w-full max-w-2xl items-center rounded-full border border-purple-500 px-4 py-2">
            <input
              type="text"
              placeholder="Message Chatbot.."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-grow bg-transparent px-2 text-sm text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-600 transition hover:bg-purple-600 hover:text-white"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col pt-16 flex-grow max-h-screen overflow-hidden">
          <div
            className="flex-grow overflow-y-auto px-4 py-6 flex flex-col items-center"
            ref={chatContainerRef}
          >
            <div className="w-full max-w-3xl flex flex-col">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} sender={msg.sender} text={msg.text} />
              ))}
            </div>
          </div>

          <div className="border-t py-3 px-4 bg-gradient-to-t from-[#03000d] to-transparent">
            <div className="flex w-full max-w-3xl mx-auto items-center rounded-full border border-purple-500 px-4 py-2 backdrop-blur-md">
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
                className="flex-grow bg-transparent px-2 text-sm text-white placeholder-gray-400 focus:outline-none resize-none overflow-y-auto"
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
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
