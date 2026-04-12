import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

const SettingContainer = styled.div`
  padding: 40px;
  max-width: 500px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
`;

const Section = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #702082;
  }
`;

const UpdateButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #702082;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  margin-top: 15px;
  font-size: 0.9rem;
  color: ${props => props.error ? "#dc3545" : "#28a745"};
  text-align: center;
`;

export default function Setting({ user }) { 
  const [password, setPassword] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", isError: false });

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      setMsg({ text: "Please log in first.", isError: true });
      return;
    }

    if (password.new !== password.confirm) {
      setMsg({ text: "New passwords do not match.", isError: true });
      return;
    }

    setLoading(true);
    setMsg({ text: "", isError: false });

    try {
      const response = await axios.post("/users/change_password", {
        email: user.email,               // params[:email]
        current_password: password.old,  // params[:current_password]
        new_password: password.new       // params[:new_password]
      });

      setMsg({ text: "Password changed successfully!", isError: false });
      setPassword({ old: "", new: "", confirm: "" });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Current password is incorrect.";
      setMsg({ text: errorMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingContainer>
      <h2>Account Settings</h2>
      <Section>
        <form onSubmit={handleUpdate}>
          <PasswordInput 
            type="password" 
            placeholder="Current Password" 
            value={password.old}
            onChange={(e) => setPassword({...password, old: e.target.value})}
          />
          <PasswordInput 
            type="password" 
            placeholder="New Password" 
            value={password.new}
            onChange={(e) => setPassword({...password, new: e.target.value})}
          />
          <PasswordInput 
            type="password" 
            placeholder="Confirm New Password" 
            value={password.confirm}
            onChange={(e) => setPassword({...password, confirm: e.target.value})}
          />
          <UpdateButton type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </UpdateButton>
        </form>
        {msg.text && <Message error={msg.isError}>{msg.text}</Message>}
      </Section>
    </SettingContainer>
  );
}