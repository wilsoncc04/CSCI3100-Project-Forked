import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. 檢查登入狀態
        const userRes = await axios.get("/sessions");
        if (!userRes.data || !userRes.data.id) {
          navigate("/login");
          return;
        }
        setCurrentUser(userRes.data);

        // 2. 獲取聊天列表
        const chatsRes = await axios.get("/chats");
        setChats(chatsRes.data);
      } catch (err) {
        console.error("Auth check failed or fetch error", err);
        navigate("/login"); // 出錯（如 401）則跳轉
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Messages & Requests ✉️</h2>
      {chats.length > 0 ? (
        chats.map(chat => {
          // 判斷對方是誰：如果我是賣家，顯示買家名；如果我是買家，顯示賣家名
          const partnerName = currentUser.id === chat.seller.id ? chat.buyer.name : chat.seller.name;
          
          return (
            <div 
              key={chat.id} 
              onClick={() => navigate(`/chat?chat_id=${chat.id}`)}
              style={{ 
                padding: "15px", borderBottom: "1px solid #eee", cursor: "pointer",
                backgroundColor: "#f9f9f9", marginBottom: "10px", borderRadius: "8px"
              }}
            >
              <strong>{partnerName}</strong>
              <p style={{ margin: "5px 0", color: "#666" }}>
                {chat.last_message || `New request for "${chat.product.name}"`}
              </p>
              <small style={{ color: "#999" }}>{new Date(chat.updated_at).toLocaleString()}</small>
            </div>
          );
        })
      ) : (
        <p style={{ color: "#999", textAlign: "center" }}>No messages yet.</p>
      )}
    </div>
  );
};

export default NotificationPage;