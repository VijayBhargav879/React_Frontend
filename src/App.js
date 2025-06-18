import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "http://localhost:5005/webhooks/rest/webhook";

function App() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting when component mounts
  useEffect(() => {
    const fetchGreeting = async () => {
      setIsTyping(true);
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: "user", message: "hello" }),
        });
        const data = await res.json();
        const botReplies = data.map((d) => ({
          sender: "bot",
          text: d.text,
        }));
        setMessages([
          {
            sender: "bot",
            text:
              "Hi! I'm your Renewable Energy Awareness Assistant. Ask me anything about solar, wind, or energy conservation!",
          },
          ...botReplies,
        ]);
      } catch (err) {
        setMessages([{ sender: "bot", text: "Error connecting to server." }]);
      } finally {
        setIsTyping(false);
      }
    };

    fetchGreeting();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "user", message: input }),
      });
      const data = await res.json();
      const botReplies = data.map((d) => ({
        sender: "bot",
        text: d.text,
      }));
      setMessages([...newMessages, ...botReplies]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Error connecting to server." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="title">🌱 Renewable Energy Awareness Chatbot</h1>
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="chat-bubble bot typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Ask me anything about renewable energy..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default App;



