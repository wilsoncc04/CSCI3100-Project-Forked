import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createConsumer } from "@rails/actioncable";

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatIdFromUrl = searchParams.get("chat_id");
  const autoSend = searchParams.get("auto_send");
  const productName = searchParams.get("product_name");
  const hasSentAutoMsg = useRef(false);

  // 1. 初始化與登入檢查
  useEffect(() => {
    const initChat = async () => {
      try {
        const userRes = await axios.get("/sessions");
        if (!userRes.data || !userRes.data.id) {
          navigate("/login");
          return;
        }
        setCurrentUser(userRes.data);

        const res = await axios.get("/chats");
        setChats(res.data);
        
        if (chatIdFromUrl) {
          const target = res.data.find(c => c.id.toString() === chatIdFromUrl);
          if (target) setActiveChat(target);
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [chatIdFromUrl, navigate]);

  // 2. ActionCable 訂閱與自動捲動
  useEffect(() => {
    if (!activeChat || !currentUser) return;

    fetchMessages(activeChat.id);

    const consumer = createConsumer();
    const subscription = consumer.subscriptions.create(
      { channel: "ChatChannel", chat_id: activeChat.id },
      {
        received(data) {
          setChatHistory((prev) => {
            // --- 核心修正：避免重複 ---
            // 檢查新收到的 data.id 是否已經在列表裡
            if (prev.some((msg) => msg.id === data.id)) {
              return prev;
            }
            return [...prev, data];
          });
          setTimeout(scrollToBottom, 50);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [activeChat, currentUser]);

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`/chats/${id}/messages`);
      setChatHistory(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 3. 處理「自動發送」
  useEffect(() => {
    if (activeChat && autoSend === "true" && productName && !hasSentAutoMsg.current) {
      const sendInitialMsg = async () => {
        try {
          const content = `Hi! I'm interested in buying "${productName}". Is it still available?`;
          // 注意：這裡不手動 setChatHistory，讓 ActionCable 統一處理即可
          await axios.post(`/chats/${activeChat.id}/messages`, { message: { message: content } });
          hasSentAutoMsg.current = true;
          setSearchParams({ chat_id: activeChat.id }); 
        } catch (err) { console.error(err); }
      };
      sendInitialMsg();
    }
  }, [activeChat, autoSend, productName, setSearchParams]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const messageContent = inputText.trim();
    if (messageContent === "" || !activeChat) return;

    try {
      // 為了避免重複，這裡我們有兩個選擇：
      // 方案 A: 這裡不更新狀態，完全交給 ActionCable received 處理（會有微小延遲但最穩）
      // 方案 B: 這裡更新狀態，但 ActionCable 必須有 ID 檢查（如上方的 .some 檢查）
      
      const res = await axios.post(`/chats/${activeChat.id}/messages`, {
        message: { message: messageContent }
      });

      // 執行方案 B: 手動加入後端回傳的正式資料（含 ID）
      setChatHistory((prev) => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      
      setInputText("");
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", height: "80vh", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden" }}>
      {/* 左側列表 */}
      <div style={{ width: "30%", borderRight: "1px solid #eee", overflowY: "auto", backgroundColor: "#fafafa" }}>
        {chats.map(chat => (
          <div key={chat.id} onClick={() => setActiveChat(chat)}
            style={{ 
              padding: "15px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", 
              backgroundColor: activeChat?.id === chat.id ? "#e6f0ff" : "transparent",
              transition: "background 0.2s"
            }}>
            <div style={{ fontWeight: "bold" }}>
              {currentUser.id === chat.seller.id ? chat.buyer.name : chat.seller.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#888", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {chat.last_message || "No messages yet"}
            </div>
          </div>
        ))}
      </div>

      {/* 右側視窗 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChat ? (
          <>
            <div style={{ padding: "15px", borderBottom: "1px solid #eee", backgroundColor: "#fff", zIndex: 1 }}>
              Chatting about: <strong>{activeChat.product.name}</strong>
            </div>

            <div id="chat-container" style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", backgroundColor: "#fdfdfd" }}>
              {chatHistory.map((msg) => {
                const isMe = currentUser && msg.sender.id === currentUser.id;
                return (
                  <div key={msg.id} style={{ 
                    alignSelf: isMe ? "flex-end" : "flex-start", 
                    marginBottom: "15px", maxWidth: "70%"
                  }}>
                    <div style={{ 
                      padding: "10px 15px", borderRadius: "15px",
                      backgroundColor: isMe ? "#0066cc" : "#e9e9eb",
                      color: isMe ? "#fff" : "#000",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      wordBreak: "break-word"
                    }}>
                      {msg.message}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#999", marginTop: "4px", textAlign: isMe ? "right" : "left" }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px", backgroundColor: "#fff" }}>
              <input 
                type="text" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder="Type a message..."
                style={{ flex: 1, padding: "10px 15px", borderRadius: "25px", border: "1px solid #ddd", outline: "none" }} 
              />
              <button type="submit" style={{ padding: "8px 20px", borderRadius: "25px", backgroundColor: "#0066cc", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;