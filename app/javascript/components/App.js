import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { 
  BsHouseDoor, 
  BsBell, 
  BsChatDots, 
  BsHandbag, 
  BsPersonCircle, 
  BsBoxArrowInRight, 
  BsPencilSquare,
  BsBoxArrowLeft

} from "react-icons/bs";
import IndexPage from "./pages/IndexPage";
import AccountPage from "./pages/AccountPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import SellPage from "./pages/SellPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NavButton from "./common/NavButton";
import { logoutUser } from "../common/loginauth";
import SearchResultsPage from "./pages/SearchResultsPage";
import CommunityPage from "./pages/CommunityPage";
import { BsPeopleFill } from "react-icons/bs";
axios.defaults.withCredentials = true;
const logo = "/logo.png";

const AppContainer = styled.div` padding: 2rem; font-family: system-ui, sans-serif; `;
const LogoImg = styled.img` height: 3.8em; width: auto; display: block; `;
const Header = styled.header` margin-bottom: 2rem; `;
const Nav = styled.nav` display: flex; justify-content: space-between; align-items: center; gap: 1.2rem; `;
const BrandLink = styled(Link)` text-decoration: none; color: #530662; display: flex; align-items: center; gap: 0.8rem; cursor: pointer; `;
const Title = styled.h2` margin: 0; font-weight: 900; line-height: 1; white-space: nowrap; `;
const NavRow = styled.div` display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; width: 100%; `;
const RightNavGroup = styled.div` display: flex; gap: 0.6rem; margin-left: auto; align-items: center; `;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 160px;
  overflow: hidden;
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
`;

const DropdownItem = styled(Link)`
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  &:hover { background-color: #f8f9fa; color: #702082; }
`;

export default function App() {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/sessions");
        setUser(res.data);
      } catch (err) {
        setUser(null); // 未登入
      }
    };
    checkAuth();
  }, []);

const handleLogoutClick = async () => {
  if (window.confirm("Are you sure you want to log out?")) {
    try {
      await logoutUser();
      
      // 關鍵步驟 1: 清空 React 全域狀態，觸發重新渲染
      setUser(null); 
      
      // 關鍵步驟 2: 關閉下拉選單，避免它「卡」在開啟狀態
      setShowProfile(false); 
      
      // 關鍵步驟 3: 清除本地緩存
      localStorage.removeItem("currentUser");

      // 建議：直接導向首頁，這會觸發重新載入
      window.location.href = "/"; 
    } catch (err) {
      console.error("Logout failed", err);
      // 即便 API 報錯，也要強行清空前端狀態
      setUser(null);
      localStorage.removeItem("currentUser");
      window.location.href = "/";
    }
  }
};
  
  return (
    <BrowserRouter>
      <AppContainer>
        <Header>
          <Nav>
            <BrandLink to="/">
              <LogoImg src="/logo.png" alt="logo" />
              <Title>CUHK Second-hand Marketplace</Title>
            </BrandLink>
            
            <NavRow>
              <NavButton label="Home" to="/" icon={BsHouseDoor} />
              <NavButton label="Community" to="/community" icon={BsPeopleFill} />
              
              <RightNavGroup>
                <NavButton label="Notifications" to="/notifications" icon={BsBell} />
                <NavButton label="Chat" to="/chat" icon={BsChatDots} />
                <NavButton label="Sell" to="/sell" icon={BsHandbag} variant="primary" />

                {/* Profile 下拉選單 */}
                <DropdownContainer 
                  onMouseEnter={() => setShowProfile(true)} 
                  onMouseLeave={() => setShowProfile(false)}
                >
                  <NavButton label="Profile" to="#" icon={BsPersonCircle} />
                  
                  <DropdownMenu show={showProfile}>
                    {user && user.email ? (  // 增加 user.email 檢查確保對象完整
                        <>
                          <div style={userEmailLabel}>{user.email}</div>
                          <DropdownItem to="/Account">
                            <BsPersonCircle /> Account
                          </DropdownItem>
                          <hr style={divider} />
                          {/* 這裡改用 button 形式確保點擊有效 */}
                          <DropdownItem as="button" onClick={handleLogoutClick} style={logoutBtnStyle}>
                           <BsBoxArrowLeft /> Log out
                          </DropdownItem>
                          </>
                        ) : (
                           <>
                          <DropdownItem to="/login">
                         <BsBoxArrowInRight /> Log in
                           </DropdownItem>
                           <DropdownItem to="/register">
                          <BsPencilSquare /> Register
                          </DropdownItem>
                      </>
                      )}  
                </DropdownMenu>
                </DropdownContainer>
              </RightNavGroup>
            </NavRow>
          </Nav>
        </Header>

        <main>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage setUser={setUser} />} />
            <Route path="/Account" element={<AccountPage setUser={setUser} />} />
            <Route path="/product/:id" element={<ProductInfoPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
          </Routes>
        </main>
      </AppContainer>
    </BrowserRouter>
  );
}

const userEmailLabel = {
  padding: "10px 16px",
  fontSize: "0.75rem",
  color: "#888",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const divider = { border: "none", borderTop: "1px solid #eee", margin: "4px 0" };

const logoutBtnStyle = {
  width: "100%",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  color: "#dc3545"
};