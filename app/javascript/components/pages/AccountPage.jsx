import React, { useState } from "react";
import AccountInfo from "./AccountInfo";
import Interested from "./Interested";
import PurchaseHistory from "./PurchaseHistory";
import Setting from "./Setting";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("Account info");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const menuItems = ["Account info", "Interested", "Purchase History", "Setting", "Log out"];

  const handleLogout = () => {
    if (window.confirm("確定要登出嗎？")) {
      setIsLoggedIn(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>您已成功登出</h2>
        <button onClick={() => setIsLoggedIn(true)} style={loginBtn}>重新登入</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Account info": return <AccountInfo />;
      case "Interested": return <Interested />;
      case "Purchase History": return <PurchaseHistory />;
      case "Setting": return <Setting />;
      default: return <AccountInfo />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={{ padding: "0 25px", color: "#007bff" }}>My Profile</h2>
        <nav style={{ marginTop: "20px" }}>
          {menuItems.map((item) => (
            <div
              key={item}
              onClick={item === "Log out" ? handleLogout : () => setActiveTab(item)}
              style={{
                ...styles.menuItem,
                backgroundColor: activeTab === item && item !== "Log out" ? "#007bff" : "transparent",
                color: activeTab === item && item !== "Log out" ? "white" : "#333",
                borderLeft: activeTab === item && item !== "Log out" ? "4px solid #0056b3" : "4px solid transparent",
                fontWeight: item === "Log out" ? "bold" : "normal",
                color: item === "Log out" ? "#dc3545" : (activeTab === item ? "white" : "#333")
              }}
            >
              {item}
            </div>
          ))}
        </nav>
      </div>

      <div style={styles.content}>
        <div style={styles.cardBox}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const loginBtn = { padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

const styles = {
  container: { display: "flex", height: "100vh", backgroundColor: "#f0f2f5" },
  sidebar: { width: "260px", backgroundColor: "white", boxShadow: "2px 0 5px rgba(0,0,0,0.05)", paddingTop: "30px", zIndex: 10 },
  menuItem: { padding: "15px 25px", cursor: "pointer", transition: "0.2s", fontSize: "15px" },
  content: { flex: 1, padding: "40px", overflowY: "auto" },
  cardBox: { backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", minHeight: "400px" }
};