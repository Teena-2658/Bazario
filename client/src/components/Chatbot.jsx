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

  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);

  /* ===============================
     DEFAULT BOT MESSAGE (GUIDE)
  =============================== */
const [messages, setMessages] = useState([
  {
    role: "bot",
    message: `Hi 👋 I am Bazario Assistant.

You can ask:
• price of iPhone
• description of shoes
• show electronics category
• show spotlight products
• show trending products
• show everyday products
• products under 20000
`,
  },
]);


  /* ===============================
     AUTO SCROLL (ONLY IF USER AT BOTTOM)
  =============================== */
  const scrollToBottom = () => {
    const container = chatBodyRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight -
        container.scrollTop -
        container.clientHeight <
      80;

    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  /* ===============================
     LOAD CHAT HISTORY (USER WISE)
  =============================== */
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

  /* ===============================
     VOICE OUTPUT
  =============================== */
  const speak = (text) => {
    if (!voiceOn) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  /* ===============================
     VOICE INPUT
  =============================== */
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

  /* ===============================
     SEND MESSAGE
  =============================== */
const sendMessage = async () => {
  if (!input.trim()) return;

  try {
    const res = await fetch(
      "https://bazario-eg4p.onrender.com/api/chat/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id,
          message: input,
        }),
      }
    );

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "user", message: input },
      { role: "bot", message: data.reply },
    ]);

    setProducts(data.products || []);
    setInput("");
  } catch (error) {
    console.log("Frontend error:", error);
  }
};

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {/* CHAT WINDOW */}
      <div
        className={`fixed bottom-24 right-6 w-96 h-[520px] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-500 z-50 ${
          open
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              Bazario Assistant
            </h2>
            <p className="text-xs opacity-80">
              Ask about products & categories
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setVoiceOn(!voiceOn)}>
              {voiceOn ? "🔊" : "🔇"}
            </button>
            <FiX onClick={() => setOpen(false)} />
          </div>
        </div>

        {/* CHAT BODY */}
        <div
          ref={chatBodyRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50"
        >
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
                className={`px-4 py-2 rounded-2xl max-w-xs text-sm shadow ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}

          {typing && (
            <div className="bg-white px-4 py-2 rounded-2xl shadow text-sm animate-pulse">
              Typing...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* PRODUCT RESULTS */}
        {productResults.length > 0 && (
          <div className="max-h-48 overflow-y-auto border-t p-2 bg-white space-y-2">
            {productResults.map((product) => (
              <div
                key={product._id}
                onClick={() =>
                  (window.location.href = `/product/${product._id}`)
                }
                className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={product.image}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-semibold">
                    {product.title}
                  </p>
                  <p className="text-blue-600 font-bold">
                    ₹{product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div className="p-3 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            placeholder="Ask something..."
            className="flex-1 px-3 py-2 border rounded-full"
          />

          <button
            onClick={startListening}
            className="bg-gray-200 p-3 rounded-full"
          >
            <FiMic size={16} />
          </button>

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
