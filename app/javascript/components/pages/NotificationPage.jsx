import React from "react";

const NotificationPage = () => {
  const notifications = [
    { id: 1, user: "Alex Chen", product: "Calculus Textbook", time: "2 mins ago" },
    { id: 2, user: "Sarah Wong", product: "MacBook Pro M2", time: "1 hour ago" },
    { id: 3, user: "Jason Li", product: "Desk Lamp", time: "3 hours ago" },
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2 style={{ color: "#333", display: "flex", alignItems: "center", gap: "10px" }}>
        Notification ✉️
      </h2>
      <p style={{ color: "#666" }}>Manage your buying requests and messages.</p>
      <hr style={{ border: "0.5px solid #eee", margin: "20px 0" }} />
      
      {notifications.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {notifications.map((noti) => (
            <li 
              key={noti.id} 
              style={{
                padding: "15px",
                borderBottom: "1px solid #eee",
                backgroundColor: "#f9f9f9",
                borderRadius: "12px",
                marginBottom: "12px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div>
                <span style={{ fontWeight: "bold", color: "#333" }}>{noti.user}</span> 
                <span style={{ color: "#555" }}> wants to buy your </span>
                <span style={{ color: "#0066cc", fontWeight: "bold" }}>
                  "{noti.product}"
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "8px" }}>
                {noti.time}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Your inbox is empty.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;