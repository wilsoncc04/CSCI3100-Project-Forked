import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";
import { 
  BsHouseDoor, 
  BsBell, 
  BsChatDots, 
  BsHandbag, 
  BsPersonCircle, 
  BsBoxArrowInRight, 
  BsPencilSquare 
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

const AppContainer = styled.div`
  padding: 2rem;
  font-family: system-ui, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const BrandLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const BrandContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const Title = styled.h2`
  margin: 0;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #546075;
`;

const NavRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  width: 100%;
`;

const RightNavGroup = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-left: auto;
  align-items: center;
`;

const navigationItems = [
  { label: "Home", to: "/", icon: BsHouseDoor },
  { label: "Notifications", to: "/notifications", icon: BsBell },
  { label: "Chat", to: "/chat", icon: BsChatDots },
  { label: "Sell", to: "/sell", icon: BsHandbag, variant: "primary" },
  { label: "Account", to: "/Account", icon: BsPersonCircle },
  { label: "Log in", to: "/login", icon: BsBoxArrowInRight },
  { label: "Register", to: "/register", icon: BsPencilSquare },
];

export default function App() {
    // just for finding the "Home" item and putting it on the left side, while others are on the right
  const homeItem = navigationItems.find(item => item.label === "Home");
  const otherItems = navigationItems.filter(item => item.label !== "Home");

  return (
    <BrowserRouter>
      <AppContainer>
        <Header>
          <Nav>
            <BrandLink to="/">
              <BrandContent>
                <Title>CUHK Second-hand Marketplace</Title>
                <Subtitle>
                  A centralized trading platform for CUHK students.
                </Subtitle>
              </BrandContent>
            </BrandLink>
            <NavRow>
              {homeItem && <NavButton {...homeItem} />}
              <RightNavGroup>
                {otherItems.map((item) => (
                  <NavButton key={item.label} {...item} />
                ))}
              </RightNavGroup>
            </NavRow>
          </Nav>
        </Header>

        <main>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/Account" element={<AccountPage />} />
            <Route path="/product/:id" element={<ProductInfoPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </AppContainer>
    </BrowserRouter>
  );
}
