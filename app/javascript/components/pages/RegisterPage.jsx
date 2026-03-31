import React, { useState } from "react";
import { registerUser, verifyToken } from "../../common/register";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 處理註冊第一步：發送資料並要求 OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("密碼確認不一致！");
      return;
    }

    setLoading(true);
    try {
      // 呼叫 API 時傳送使用者輸入的 name
      await registerUser({
        name: name, 
        email: email,
        password: password
      });
      
      setShowOtpPopup(true); 
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "註冊失敗，請檢查 Email 是否重複或格式錯誤");
    } finally {
      setLoading(false);
    }
  };

const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await verifyToken(email, otp); 
    
    if (result.message === 'verified') {
      alert("註冊成功！");
      navigate("/login");
    }
  } catch (error) {
    console.error("Verify Error:", error.response?.data);
    alert("驗證失敗，請檢查驗證碼是否正確");
  } finally {
    setLoading(false);
  }
};

  // --- UI 樣式 ---
  const inputStyle = { width: "100%", padding: "12px", margin: "10px 0", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" };
  const buttonStyle = { width: "100%", padding: "12px", backgroundColor: "#702082", color: "white", border: "none", borderRadius: "25px", fontWeight: "bold", cursor: "pointer", marginTop: "15px" };
  const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };

  return (
    <div style={{ maxWidth: "400px", margin: "60px auto", padding: "2rem", border: "1px solid #eee", borderRadius: "15px", textAlign: "center" }}>
      <h2 style={{ color: "#702082" }}>Register</h2>
      <form onSubmit={handleRegisterSubmit}>
        {/* 新增的 User Name 輸入框 */}
        <input 
          style={inputStyle} 
          type="text" 
          placeholder="User Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        
        <input style={inputStyle} type="email" placeholder="CUHK Email (@link.cuhk.edu.hk)" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input style={inputStyle} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Sending..." : "Create Account"}
        </button>
      </form>

      {/* 驗證碼彈窗 */}
      {showOtpPopup && (
        <div style={overlayStyle}>
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "15px", width: "300px" }}>
            <h3>Verify OTP</h3>
            <p style={{ fontSize: "0.8rem" }}>Check your CUHK email for the code</p>
            <form onSubmit={handleVerifyOtp}>
              <input 
                style={{ ...inputStyle, textAlign: "center", fontSize: "1.2rem" }} 
                type="text" 
                placeholder="Enter Token" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;