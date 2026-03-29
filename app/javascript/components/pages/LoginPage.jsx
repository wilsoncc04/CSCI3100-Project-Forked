import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
    setShowOtpPopup(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Verifying OTP:", otp);
    alert("驗證成功！");
    setShowOtpPopup(false);
  };

  const modalStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "300px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "4px",
    border: "1px solid #ddd",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e60000",
    color: "white",
    border: "none",
    borderRadius: "20px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", textAlign: "center" }}>
      <h2>Log In</h2>
      <form onSubmit={handleLoginSubmit}>
        <input
          style={inputStyle}
          type="email"
          placeholder="Login Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={buttonStyle}>Enter</button>
      </form>

      {/* 驗證碼彈窗 (Verification Pop-up) */}
      {showOtpPopup && (
        <div style={modalStyle}>
          <div style={cardStyle}>
            <h3>Verify Code</h3>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Please enter the code sent to your email.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                style={inputStyle}
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
              />
              <button type="submit" style={buttonStyle}>Verify</button>
              <button 
                type="button" 
                onClick={() => setShowOtpPopup(false)}
                style={{ ...buttonStyle, backgroundColor: "#ccc", marginTop: "5px" }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;