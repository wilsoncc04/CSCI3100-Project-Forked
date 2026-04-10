import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { 
  BsBell, 
  BsChatDots, 
  BsHandbag, 
  BsPersonCircle, 
  BsBoxArrowInRight, 
  BsPencilSquare,
  BsBoxArrowLeft,
  BsGear,
  BsPeopleFill,
  BsHouseDoor
} from "react-icons/bs";

import IndexPage from "./pages/IndexPage";
import AccountPage from "./pages/AccountPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import SellPage from "./pages/SellPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CommunityPage from "./pages/CommunityPage";
import NavButton from "./common/NavButton";
import { logoutUser } from "../common/loginauth";
import SearchResultsPage from "./pages/SearchResultsPage";

axios.defaults.withCredentials = true;

const AppContainer = styled.div` max-width: 90%; margin: 0 auto; width: 100%; padding: 2rem; font-family: system-ui, sans-serif; box-sizing: border-box;`;
const LogoImg = styled.img` height: 3.8em; width: auto; display: block; &:hover ${LogoImg} { transform: scale(1.05); }  `;
const Header = styled.header` margin-bottom: 2rem; `;
const Nav = styled.nav` display: flex; justify-content: space-between; align-items: center; gap: 1.2rem; `;
const BrandLink = styled(Link)` text-decoration: none; color: #530662; display: flex; align-items: center;
                               gap: 0.8rem; cursor: pointer; padding: 0.5rem; `;
const Title = styled.h2` margin: 0; font-weight: 900; line-height: 1; white-space: nowrap; &:hover ${Title} { transform: scale(1.007); } `;
const NavRow = styled.div` display: flex; gap: 0.6rem; align-items: center; width: 100%; `;
const RightNavGroup = styled.div` display: flex; gap: 0.6rem; margin-left: auto; align-items: center; `;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 100%; 
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%; 
  right: 0;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 180px;
  display: ${props => props.show ? 'flex' : 'none'};
  flex-direction: column;
  margin-top: 5px; 

  &::before {
    content: "";
    position: absolute;
    top: -15px;
    left: 0;
    right: 0;
    height: 15px;
    background: transparent;
  }
`;

const DropdownItem = styled(Link)`
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
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
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogoutClick = async (e) => {
    e.preventDefault(); 
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logoutUser();
        setUser(null); 
        setShowProfile(false); 
        localStorage.removeItem("currentUser");
        window.location.href = "/"; 
      } catch (err) {
        console.error("Logout failed", err);
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
              <NavButton label="Community" to="/community" icon={BsPeopleFill} />
  
               <RightNavGroup>
                <NavButton label="Notifications" to="/notifications" icon={BsBell} />
                <NavButton label="Chat" to="/chat" icon={BsChatDots} />
                <NavButton label="Sell" to="/sell" icon={BsHandbag} variant="primary" />

                <DropdownContainer 
                  onMouseEnter={() => setShowProfile(true)} 
                  onMouseLeave={() => setShowProfile(false)}
                >
                  <NavButton label="Setting" to="#" icon={BsGear} />
                  
                  <DropdownMenu show={showProfile}>
                    {user && user.email ? (
                      <>
                        <div style={userEmailLabel}>{user.email}</div>
                        <DropdownItem to="/Account">
                          <BsPersonCircle /> Account Info
                        </DropdownItem>
                        <hr style={divider} />
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
            <Route path="/edit/:id" element={<SellPage />} />
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
  padding: "12px 16px",
  fontSize: "0.8rem",
  color: "#666",
  backgroundColor: "#fcfcfc",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: "500"
};

const divider = { border: "none", borderTop: "1px solid #eee", margin: "0" };

const logoutBtnStyle = {
  width: "100%",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  color: "#dc3545",
  fontWeight: "500",
  fontFamily: "inherit"
};