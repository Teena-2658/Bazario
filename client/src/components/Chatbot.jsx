import { useState, useEffect, useRef } from "react";
import { FiMessageCircle, FiX, FiSend, FiMic } from "react-icons/fi";
import { API_URL } from "../config";

const Chatbot = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [typing, setTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      message:
        "Hi 👋 I am Bazario Assistant. Ask me about products, prices or orders.",
    },
  ]);

  const chatEndRef = useRef(null);

  // ✅ Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Load Previous Chats (Login User Only)
  useEffect(() => {
    if (!user) return;

    const loadChat = async () => {
      const res = await fetch(`${API_URL}/api/chat/${user._id}`);
      const data = await res.json();

      if (data.length > 0) {
        setMessages(data);
      }
    };

    loadChat();
  }, [user]);

  // 🔊 Voice Output (Optional)
  const speak = (text) => {
    if (!voiceOn) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  // 🎤 Voice Input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
  };

  // ✅ SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      message: input,
    };

    setMessages((prev) => [...prev, userMsg]);

    // save user message
    if (user) {
      await fetch(`${API_URL}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          message: input,
          role: "user",
        }),
      });
    }

    const userText = input;
    setInput("");
    setTyping(true);

    try {
      // ✅ REAL BACKEND RESPONSE
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setTimeout(async () => {
        const botMsg = {
          role: "bot",
          message: data.reply,
        };

        setMessages((prev) => [...prev, botMsg]);
        setTyping(false);

        speak(data.reply);

        // save bot reply
        if (user) {
          await fetch(`${API_URL}/api/chat/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user._id,
              message: data.reply,
              role: "bot",
            }),
          });
        }
      }, 600);
    } catch (err) {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-96 h-[520px] bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl flex flex-col overflow-hidden transform transition-all duration-500 z-50 ${
          open
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">
              Bazario Assistant
            </h2>
            <p className="text-xs opacity-80">
              Ecommerce Support Bot
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice Toggle */}
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className="text-sm"
            >
              {voiceOn ? "🔊" : "🔇"}
            </button>

            <button onClick={() => setOpen(false)}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow-md ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-2xl shadow-md text-sm animate-pulse">
                Typing...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about products..."
            className="flex-1 px-3 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={startListening}
            className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition"
          >
            <FiMic size={16} />
          </button>

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
