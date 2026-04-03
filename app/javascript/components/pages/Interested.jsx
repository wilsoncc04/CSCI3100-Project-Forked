import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Interested() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        // 發送請求到我們剛剛在 Rails 增加的路由
        const response = await axios.get("/users/interests");
        setInterests(response.data);
      } catch (err) {
        console.error("Fetch interests failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading your list...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#702082" }}>Goods I'm Interested In</h2>
      
      {interests.length === 0 ? (
        <p>You haven't marked any items as interested yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {interests.map((item) => (
            <div 
              key={item.id} 
              onClick={() => navigate(`/product/${item.id}`)}
              style={{ 
                display: "flex", 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                overflow: "hidden", 
                cursor: "pointer",
                alignItems: "center"
              }}
            >
              <img 
                src={item.images[0] || "https://via.placeholder.com/100"} 
                alt={item.name} 
                style={{ width: "100px", height: "100px", objectFit: "cover" }} 
              />
              <div style={{ padding: "15px" }}>
                <h3 style={{ margin: "0 0 5px 0" }}>{item.name}</h3>
                <p style={{ color: "#e60000", fontWeight: "bold", margin: 0 }}>
                  ${item.price} HKD
                </p>
                <span style={{ fontSize: "0.8rem", color: "#888" }}>
                  Status: {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}