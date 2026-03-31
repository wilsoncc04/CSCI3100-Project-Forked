import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AccountInfo from "./AccountInfo";
import Interested from "./Interested";
import SellingProduct from "./SellingProduct";
import Setting from "./Setting";
import { logoutUser } from "../../common/loginauth"; 

export default function AccountPage({ setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account info");
  const [userData, setUserData] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/sessions"); 
        setUserData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Not authenticated");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logoutUser();
        // 1. 清除 App.js 的全局狀態
        if (setUser) setUser(null); 
        // 2. 清除本地存儲
        localStorage.removeItem("currentUser");
        // 3. 跳轉
        navigate("/login");
      } catch (error) {
        alert("Logout failed");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h3 style={{ color: "#702082" }}>Loading your profile...</h3>
      </div>
    );
  }

  const menuItems = ["Account info", "Interested", "Selling Products", "Setting", "Log out"];

  const renderContent = () => {
    switch (activeTab) {
      case "Account info": return <AccountInfo user={userData} />;
      case "Interested": return <Interested />;
      case "Selling Products": return <SellingProduct />;
      case "Setting": return <Setting user={userData} />;
      default: return <AccountInfo user={userData} />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={{ padding: "0 25px", color: "#702082" }}>My Profile</h2>
        <div style={{ padding: "0 25px", color: "#666", fontSize: "0.9rem" }}>
          {/* 修正點：這裡要使用 userData 而不是 user */}
          Hi, {userData?.name || "User"}
        </div>
        <nav style={{ marginTop: "20px" }}>
          {menuItems.map((item) => (
            <div
              key={item}
              onClick={item === "Log out" ? handleLogout : () => setActiveTab(item)}
              style={{
                ...styles.menuItem,
                backgroundColor: (activeTab === item && item !== "Log out") ? "#702082" : "transparent",
                borderLeft: (activeTab === item && item !== "Log out") ? "4px solid #530662" : "4px solid transparent",
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

const styles = {
  container: { display: "flex", height: "100vh", backgroundColor: "#f0f2f5" },
  sidebar: { width: "260px", backgroundColor: "white", boxShadow: "2px 0 5px rgba(0,0,0,0.05)", paddingTop: "30px", zIndex: 10 },
  menuItem: { padding: "15px 25px", cursor: "pointer", transition: "0.2s", fontSize: "15px" },
  content: { flex: 1, padding: "40px", overflowY: "auto" },
  cardBox: { backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", minHeight: "400px" }
};