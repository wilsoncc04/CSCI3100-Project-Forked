import React, { useState } from "react";

const ChatPage = () => {
  const [inputText, setInputText] = useState("");
  
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: "Alex Chen", text: "Is the book still available?", time: "10:30 AM", isMe: false },
    { id: 2, sender: "Me", text: "Hi! Yes, it's still available. When are you free?", time: "10:32 AM", isMe: true },
  ]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault(); 
    if (inputText.trim() === "") return; 

    const newMessage = {
      id: Date.now(), 
      sender: "Me",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setChatHistory([...chatHistory, newMessage]); 
    setInputText(""); 
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "75vh", 
      border: "1px solid #ddd", 
      borderRadius: "12px", 
      overflow: "hidden",
      backgroundColor: "#fff"
    }}>
      <div style={{ width: "30%", borderRight: "1px solid #eee", backgroundColor: "#fcfcfc" }}>
        <div style={{ padding: "15px", borderBottom: "1px solid #eee", fontWeight: "bold" }}>Messages</div>
        <div style={{ padding: "15px", backgroundColor: "#e6f0ff", fontWeight: "bold", fontSize: "0.9rem" }}>
          Alex Chen
        </div>
      </div>

      <div style={{ width:70, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "15px", borderBottom: "1px solid #eee", fontWeight: "bold" }}>Alex Chen</div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f4f7f9", display: "flex", flexDirection: "column" }}>
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                alignSelf: msg.isMe ? "flex-end" : "flex-start", 
                marginBottom: "15px",
                maxWidth: "70%"
              }}
            >
              <div style={{ 
                padding: "10px 15px", 
                borderRadius: msg.isMe ? "15px 15px 0 15px" : "15px 15px 15px 0", 
                backgroundColor: msg.isMe ? "#0066cc" : "#fff",
                color: msg.isMe ? "#fff" : "#333",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#999", marginTop: "5px", textAlign: msg.isMe ? "right" : "left" }}>
                {msg.time}
              </div>
            </div>
          ))}
        </div>

        <form 
          onSubmit={handleSendMessage}
          style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}
        >
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ 
              flex: 1, 
              padding: "10px 15px", 
              borderRadius: "20px", 
              border: "1px solid #ddd",
              outline: "none"
            }} 
          />
          <button 
            type="submit"
            style={{ 
              padding: "8px 20px", 
              borderRadius: "20px", 
              border: "none", 
              backgroundColor: "#0066cc", 
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;