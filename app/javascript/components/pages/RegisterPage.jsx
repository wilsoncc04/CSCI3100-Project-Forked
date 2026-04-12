import React, { useState } from "react";
import { registerUser, verifyToken } from "../../common/register";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const RegisterContainer = styled.div`
  padding: 40px;
  max-width: 500px;
  margin: 60px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  text-align: center;
`;

const Title = styled.h2`
  color: #702082;
  margin-bottom: 25px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #702082;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #702082;
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 10px;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Popup = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  width: 320px;
  text-align: center;
  box-shadow: 0 4px 25px rgba(0,0,0,0.2);
`;

const PopupTitle = styled.h3`
  margin-bottom: 10px;
  color: #333;
`;

const SmallText = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 20px;
`;

const RegisterPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle the first step of registration: sending data and requesting OTP
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: name, 
        email: email,
        password: password
      });
      setShowOtpPopup(true); 
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Registration failed. Please check if the email is already in use or the format is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and final registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyToken(email, otp); 
      
      if (result.message === 'verified') {
        alert("Verification successful! Redirecting to complete your profile...");
        
        // Update global state with the user object returned from the backend
        if (setUser && result.user) {
          setUser(result.user);
        }

        // Navigate to the Account page for further profile setup
        navigate("/Account");
      }
    } catch (error) {
      console.error("Verify Error:", error.response?.data);
      alert("Verification failed. Please check if the OTP is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Title>Register</Title>
      <form onSubmit={handleRegisterSubmit}>
        <Input 
          type="text" 
          placeholder="User Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <Input 
          type="email" 
          placeholder="CUHK Email (@link.cuhk.edu.hk)" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <Input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? "Sending..." : "Create Account"}
        </SubmitButton>
      </form>

      {/* OTP Verification Popup Overlay */}
      {showOtpPopup && (
        <Overlay>
          <Popup>
            <PopupTitle>Verify OTP</PopupTitle>
            <SmallText>Check your CUHK email for the code</SmallText>
            <form onSubmit={handleVerifyOtp}>
              <Input 
                style={{ textAlign: "center", fontSize: "1.2rem", letterSpacing: "2px" }} 
                type="text" 
                placeholder="Enter Token" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              <SubmitButton type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Register"}
              </SubmitButton>
            </form>
          </Popup>
        </Overlay>
      )}
    </RegisterContainer>
  );
};

export default RegisterPage;