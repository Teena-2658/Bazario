import { useState, useEffect, useRef } from "react";
import { FiMessageCircle, FiX, FiSend, FiMic } from "react-icons/fi";
import { API_URL } from "../config";

const Chatbot = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [typing, setTyping] = useState(false);
const [productResults, setProductResults] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      message:
        "Hi 👋 I am Bazario Assistant. Ask me about products, prices or categories.",
    },
  ]);

  const chatEndRef = useRef(null);

  // ✅ Auto Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ LOAD USER CHAT HISTORY
  useEffect(() => {
    if (!user) return;

    const loadChat = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/chat/${user._id}`
        );

        const data = await res.json();

        if (data.length > 0) {
          setMessages(data);
        }
      } catch (err) {
        console.log("Chat load error");
      }
    };

    loadChat();
  }, [user]);

  // 🔊 Voice Output
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
      alert("Voice not supported");
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

    const userText = input;

    const userMsg = {
      role: "user",
      message: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // ✅ NEW API (IMPORTANT CHANGE)
      const res = await fetch(
        `${API_URL}/api/chat/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?._id,
            message: userText,
          }),
        }
      );

      const data = await res.json();

setTimeout(() => {
  const botMsg = {
    role: "bot",
    message: data.reply,
  };

  setMessages((prev) => [...prev, botMsg]);

  // ✅ ADD THIS PART
  if (data.products && data.products.length > 0) {
    setProductResults(data.products);
  } else {
    setProductResults([]);
  }

  setTyping(false);
  speak(data.reply);
}, 600);

    } catch (err) {
      console.log(err);
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
            <button onClick={() => setVoiceOn(!voiceOn)}>
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
{/* ✅ PRODUCT CARDS */}
{productResults.length > 0 && (
  <div className="grid grid-cols-1 gap-3 mt-2">
    {productResults.map((product) => (
      <div
        key={product._id}
        onClick={() =>
          (window.location.href = `/product/${product._id}`)
        }
        className="bg-white p-3 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
      >
        <img
          src={product.image}
          alt={product.title}
          className="h-32 w-full object-cover rounded-md mb-2"
        />
        <h3 className="font-semibold text-sm">
          {product.title}
        </h3>
        <p className="text-blue-600 font-bold">
          ₹{product.price}
        </p>
      </div>
    ))}
  </div>
)}

        {/* Input */}
        <div className="p-3 border-t bg-white flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
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
