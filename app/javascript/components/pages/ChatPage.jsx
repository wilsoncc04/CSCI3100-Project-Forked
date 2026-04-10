import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createConsumer } from "@rails/actioncable";

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatIdFromUrl = searchParams.get("chat_id");
  const autoSend = searchParams.get("auto_send"); // 如果 URL 有 auto_send=true
  const hasSentAutoMsg = useRef(false);

  // --- 判斷邏輯 ---
  const isSeller = currentUser && activeChat && (
  Number(currentUser.id) === Number(activeChat.product.seller_id) || 
  Number(currentUser.id) === Number(activeChat.seller?.id)
);
  
  // 修正：只有當 product.buyer_id 真的等於當前聊天的買家 ID 時，才算是 "Primary Buyer"
  const isPrimaryBuyer = activeChat && Number(activeChat.product.buyer_id) === Number(activeChat.buyer.id);

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

  // WebSocket 處理
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    fetchMessages(activeChat.id);

    const consumer = createConsumer();
    const subscription = consumer.subscriptions.create(
      { channel: "ChatChannel", chat_id: activeChat.id },
      {
        received(data) {
          setChatHistory((prev) => {
            if (prev.some((msg) => msg.id === data.id)) return prev;
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
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageContent = customText || inputText.trim();
    if (messageContent === "" || !activeChat) return;

    try {
      const res = await axios.post(`/chats/${activeChat.id}/messages`, {
        message: { message: messageContent }
      });
      setChatHistory((prev) => [...prev, res.data]);
      if (!customText) setInputText("");
      setTimeout(scrollToBottom, 50);
    } catch (err) { console.error("Failed to send message", err); }
  };

const handleFinalConfirm = async (targetBuyerId) => {
  if (!window.confirm("Confirm selling to this buyer? Other chats for this item will be closed.")) return;

  try {
    const res = await axios.patch(`/products/${activeChat.product.id}`, {
      product: { status: 'sold', buyer_id: targetBuyerId }
    });

    if (res.status === 200) {
      alert("Success! Item sold.");
      
      const updatedProduct = { ...activeChat.product, status: 'sold', buyer_id: targetBuyerId };

      // 更新當前聊天視窗
      setActiveChat(prev => ({ ...prev, product: updatedProduct }));

      // 同步更新左側列表，並過濾掉其他人的聊天（因為後端已經刪除其他人的 chat）
      // 這裡建議直接重新 fetch /chats 最保險，或者手動 filter
      setChats(prev => prev.filter(c => c.product.id !== updatedProduct.id || Number(c.buyer.id) === Number(targetBuyerId)));
      
      // 發送成交的系統訊息
      await handleSendMessage(null, "🎊 System: The seller has confirmed the trade. Item SOLD.");
    }
  } catch (err) {
    alert("Error confirming trade");
  }
};

const handleCancelThisChat = async (chatId) => {
  if (!window.confirm("Reject this buyer? This chat will disappear.")) return;

  try {
    // 呼叫我們剛才在後端寫的邏輯
    await axios.patch(`/products/${activeChat.product.id}`, {
      action_type: 'cancel_chat',
      chat_id: chatId
    });

    // 從列表移除並導向
    setChats(prev => prev.filter(c => c.id !== chatId));
    setActiveChat(null);
    alert("Chat closed.");
  } catch (err) {
    alert("Error closing chat");
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
              backgroundColor: activeChat?.id === chat.id ? "#e6f0ff" : "transparent"
            }}>
            <div style={{ fontWeight: "bold" }}>
              {Number(currentUser.id) === Number(chat.seller.id) ? chat.buyer.name : chat.seller.name}
              {/* 顯示預約標籤：商品處於預約狀態，且該買家就是預約的人 */}
              {chat.product.status === 'reserved' && Number(chat.product.buyer_id) === Number(chat.buyer.id) && 
                <span style={{ fontSize: "0.7rem", backgroundColor: "#fff3cd", color: "#856404", padding: "2px 6px", borderRadius: "4px", marginLeft: "5px" }}>預約中</span>
              }
            </div>
            <div style={{ fontSize: "0.8rem", color: "#888", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {chat.product.name}
            </div>
          </div>
        ))}
      </div>

      {/* 右側視窗 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChat ? (
          <>
            <div style={{ padding: "15px", borderBottom: "1px solid #eee", backgroundColor: "#fff" }}>
              Chatting about: <strong>{activeChat.product.name}</strong> 
              <span style={{ marginLeft: "10px", color: "#888" }}>({activeChat.product.status})</span>
              
              {!isSeller && activeChat.product.status === 'reserved' && (
                <span style={{ marginLeft: "10px", fontWeight: "bold", color: isPrimaryBuyer ? "#28a745" : "#fd7e14" }}>
                  {isPrimaryBuyer ? " (You are the primary buyer)" : " (You are in the waitlist)"}
                </span>
              )}
            </div>

            <div id="chat-container" style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", backgroundColor: "#fdfdfd" }}>
              {chatHistory.map((msg) => {
                const isMe = currentUser && Number(msg.sender.id) === Number(currentUser.id);
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", marginBottom: "15px", maxWidth: "70%" }}>
                    <div style={{ padding: "10px 15px", borderRadius: "15px", backgroundColor: isMe ? "#0066cc" : "#e9e9eb", color: isMe ? "#fff" : "#000" }}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 交易控制按鈕 */}
            {activeChat.product.status !== 'sold' && isSeller && (
  <div style={{ padding: "10px 15px", borderTop: "1px solid #eee", backgroundColor: "#f9f9f9", display: "flex", gap: "10px", justifyContent: "center" }}>
    
    {/* 直接顯示成交按鈕 */}
    <button 
      onClick={() => handleFinalConfirm(activeChat.buyer.id)} 
      style={styles.confirmTradeBtn}
    >
      Confirm Trade (Sell to this User)
    </button>

    {/* 拒絕或取消這段對話 */}
    <button 
      onClick={() => handleCancelThisChat(activeChat.id)} 
      style={styles.cancelTradeBtn}
    >
      Cancel / Reject Buyer
    </button>
    
  </div>
)}

            <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px", backgroundColor: "#fff" }}>
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: "10px 15px", borderRadius: "25px", border: "1px solid #ddd" }} />
              <button type="submit" style={{ padding: "8px 20px", borderRadius: "25px", backgroundColor: "#0066cc", color: "#fff", border: "none", cursor: "pointer" }}>Send</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Select a conversation</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  cancelTradeBtn: { padding: "8px 16px", borderRadius: "6px", backgroundColor: "#fff", color: "#dc3545", border: "1px solid #dc3545", fontWeight: "bold", cursor: "pointer" },
  confirmTradeBtn: { padding: "8px 16px", borderRadius: "6px", backgroundColor: "#28a745", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" },
  switchBuyerBtn: { padding: "8px 16px", borderRadius: "6px", backgroundColor: "#fd7e14", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }
};

export default ChatPage;