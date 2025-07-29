import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn, setUserId, setUserName, setChatsFromBackend } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        alert("Invalid credentials");
        return;
      }

      const data = await response.json();
      const userId = data.email;
      const name = data.name || email.split("@")[0];

      // ✅ Set auth context
      setIsLoggedIn(true);
      setUserId(userId);
      setUserName(name);
      localStorage.setItem("userEmail", email);

      // ✅ Fetch chat history
      const historyRes = await fetch(`http://localhost:5000/chat-history?userId=${userId}`);
      if (!historyRes.ok) throw new Error("Failed to fetch chat history");

      const historyData = await historyRes.json();
      const { chats = [], chatMessages = {}, length = 0 } = historyData;

      // ✅ Sort chats latest first using chatId timestamp if needed
      const sortedChats = chats.sort((a, b) => (b.chatId || "").localeCompare(a.chatId || ""));

      // ✅ Set chats in AuthContext
      setChatsFromBackend(sortedChats, chatMessages);

      // ✅ Navigate to chatbot page
      navigate("/chatbot");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0e001d] via-[#1a0733] to-[#3d2171] text-white">
      <div className="flex flex-wrap justify-center items-start gap-10 px-10 py-24">
        <div className="w-full max-w-md bg-[#3a0066] p-10 rounded-xl border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />

            <div className="flex justify-end text-sm text-gray-300 -mt-2 mb-2">
              <Link to="/forgot_password" className="hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="bg-[#cc33ff] hover:bg-[#aa00cc] text-white font-semibold py-3 rounded"
            >
              Login
            </button>

            <p className="text-center text-sm mt-4">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-purple-300 underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        <div className="w-full max-w-md bg-[#400080] p-10 rounded-xl border border-white/20 shadow-2xl text-gray-200">
          <h3 className="text-xl font-bold mb-4">Welcome to IITI Bot</h3>
          <p>
            Join the AI-powered journey of IIT Indore. From students to
            researchers, everyone can leverage this platform to access
            personalized insights and services across the academic ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
