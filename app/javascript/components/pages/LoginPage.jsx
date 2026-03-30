import React, { useState } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState(""); // 改為 username
  const [password, setPassword] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // 這裡實作登入邏輯
    console.log("Login attempt:", { username, password });
    alert(`嘗試登入：${username}`);
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
    fontSize: "1rem"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0066cc", // 改用藍色區分登入與 Sell
    color: "white",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "1rem"
  };

  return (
    <div style={{ 
      maxWidth: "350px", 
      margin: "80px auto", 
      padding: "2rem", 
      border: "1px solid #eee", 
      borderRadius: "15px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      textAlign: "center" 
    }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <div style={{ textAlign: "left", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>User Name</div>
        <input
          style={inputStyle}
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <div style={{ textAlign: "left", marginBottom: "5px", marginTop: "10px", fontSize: "0.9rem", fontWeight: "bold" }}>Password</div>
        <input
          style={inputStyle}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" style={buttonStyle}>Enter</button>
      </form>
      
      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#666" }}>
        New user? <a href="/register" style={{ color: "#0066cc", textDecoration: "none" }}>Register an account</a>
      </p>
    </div>
  );
};

export default LoginPage;