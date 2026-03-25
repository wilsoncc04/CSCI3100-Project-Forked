import React, { useState } from "react";
import styled from "styled-components";

const SettingContainer = styled.div`
  padding: 20px;
  max-width: 400px;
`;

const Section = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h4`
  margin-bottom: 10px;
`;

const CheckboxLabel = styled.label`
  display: block;
  margin-bottom: 10px;
`;

const Divider = styled.hr`
  margin: 20px 0;
  border: 0.5px solid #eee;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const UpdateButton = styled.button`
  padding: 10px 20px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export default function Setting() {
  const [password, setPassword] = useState({ old: "", new: "" });

  const handleUpdate = () => {
    alert("password updated！");
    setPassword({ old: "", new: "" });
  };

  return (
    <SettingContainer>
      <h2>Settings</h2>
      <Section>
        <SectionTitle>Anouncement Setting</SectionTitle>
        <CheckboxLabel>
          <input type="checkbox" defaultChecked /> accept new message notifications
        </CheckboxLabel>
        
        <Divider />
        
        <SectionTitle>Change Password</SectionTitle>
        <PasswordInput 
          type="password" 
          placeholder="Old Password" 
          value={password.old}
          onChange={(e) => setPassword({...password, old: e.target.value})}
        />
        <PasswordInput 
          type="password" 
          placeholder="New Password" 
          value={password.new}
          onChange={(e) => setPassword({...password, new: e.target.value})}
        />
        <UpdateButton onClick={handleUpdate}>Update Settings</UpdateButton>
      </Section>
    </SettingContainer>
  );
}