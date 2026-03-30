import React, { useState } from "react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // 檢查是否為 CUHK Email (簡單範例)
    if (!email.endsWith("@link.cuhk.edu.hk") && !email.endsWith("@cuhk.edu.hk")) {
      alert("Please use a valid CUHK Email address.");
      return;
    }
    
    console.log("Registering with:", { email, password });
    // 這裡通常會呼叫後端 API 寄送驗證碼
    setShowOtpPopup(true); 
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Verifying OTP:", otp);
    alert("Registration Successful! Welcome to CUHK Marketplace.");
    setShowOtpPopup(false);
    // 註冊成功後通常會導向登入頁或主頁
    window.location.href = "/login";
  };

  // 樣式設定
  const containerStyle = {
    maxWidth: "400px",
    margin: "60px auto",
    padding: "2rem",
    border: "1px solid #eee",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    textAlign: "center"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#e60000",
    color: "white",
    border: "none",
    borderRadius: "25px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
    fontSize: "1rem"
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#702082" }}>Create Account</h2>
      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
        Join our CUHK student community
      </p>

      <form onSubmit={handleRegisterSubmit}>
        <div style={{ textAlign: "left", fontSize: "0.85rem", fontWeight: "bold" }}>CUHK Email</div>
        <input
          style={inputStyle}
          type="email"
          placeholder="yourname@link.cuhk.edu.hk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div style={{ textAlign: "left", fontSize: "0.85rem", fontWeight: "bold", marginTop: "10px" }}>Password</div>
        <input
          style={inputStyle}
          type="password"
          placeholder="Min 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: "left", fontSize: "0.85rem", fontWeight: "bold", marginTop: "10px" }}>Confirm Password</div>
        <input
          style={inputStyle}
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" style={buttonStyle}>Register Now</button>
      </form>

      {/* 驗證碼彈窗 (Verification Pop-up) */}
      {showOtpPopup && (
        <div style={modalOverlayStyle}>
          <div style={{ backgroundColor: "white", padding: "2.5rem", borderRadius: "15px", width: "320px", textAlign: "center" }}>
            <h3 style={{ marginTop: 0 }}>Verify Your Email</h3>
            <p style={{ fontSize: "0.85rem", color: "#555" }}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", letterSpacing: "5px" }}
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
              <button type="submit" style={buttonStyle}>Confirm & Finish</button>
              <button 
                type="button" 
                onClick={() => setShowOtpPopup(false)}
                style={{ background: "none", border: "none", color: "#666", marginTop: "15px", cursor: "pointer", textDecoration: "underline" }}
              >
                Back to Edit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;