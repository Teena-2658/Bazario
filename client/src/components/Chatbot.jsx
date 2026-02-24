import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        {
          message: input,
          history: updatedMessages.slice(-5),
        }
      );

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Server error. Please try again later.",
        },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full 
             shadow-2xl bg-white 
             flex items-center justify-center 
             hover:scale-110 transition-all duration-300"
      >
        <img
          src="data:image/jpeg;base64,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"
          alt="Chatbot Logo"
          className="w-12 h-12 object-contain rounded-full"
        />
      </button>




      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[480px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 backdrop-blur-lg">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 font-semibold flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
              <img
                src="data:image/jpeg;base64,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"
                alt="Chatbot Logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="text-lg tracking-wide">Bazario Assistant</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">

            {/* Welcome Card */}
            {messages.length === 0 && (
              <div className="bg-white shadow-md rounded-2xl p-4 text-center border border-gray-100">
                <div className="text-lg font-semibold text-blue-600 mb-2">
                  👋 I am your chatbot
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ask me about <b>price</b>, <b>title</b>, or <b>description</b> of any product.
                  <br />
                  You can also say:
                  <br />
                  <span className="text-blue-500">
                    “Show me home category products”
                  </span>
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${msg.role === "user"
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-200 text-gray-800"
                  }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl text-sm w-fit animate-pulse">
                Typing...
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && sendMessage()
              }
              placeholder="Ask about products..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );

};

export default Chatbot;
