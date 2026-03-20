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
    alert("密碼更新成功！");
    setPassword({ old: "", new: "" });
  };

  return (
    <SettingContainer>
      <h2>Settings</h2>
      <Section>
        <SectionTitle>通知設定</SectionTitle>
        <CheckboxLabel>
          <input type="checkbox" defaultChecked /> 接收電子郵件通知
        </CheckboxLabel>
        
        <Divider />
        
        <SectionTitle>更改密碼</SectionTitle>
        <PasswordInput 
          type="password" 
          placeholder="舊密碼" 
          value={password.old}
          onChange={(e) => setPassword({...password, old: e.target.value})}
        />
        <PasswordInput 
          type="password" 
          placeholder="新密碼" 
          value={password.new}
          onChange={(e) => setPassword({...password, new: e.target.value})}
        />
        <UpdateButton onClick={handleUpdate}>更新設定</UpdateButton>
      </Section>
    </SettingContainer>
  );
}