import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import AccountInfo from "./AccountInfo";
import Interested from "./Interested";
import SellingProduct from "./SellingProduct";
import Setting from "./Setting";
import { logoutUser } from "../../common/loginauth";
import { notify } from "../../common/notify";


const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
`;

const Sidebar = styled.div`
  width: 280px;
  background-color: white;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

const SidebarHeader = styled.div`
  padding: 0 30px 20px 30px;
`;

const SidebarTitle = styled.h2`
  color: #702082;
  margin: 0;
  font-size: 1.5rem;
`;

const WelcomeText = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin: 5px 0 0 0;
`;

const NavList = styled.nav`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.div`
  padding: 16px 30px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 1rem;
  display: flex;
  align-items: center;

  background-color: ${props => props.active ? "#702082" : "transparent"};
  color: ${props => {
    if (props.isLogout) return "#dc3545";
    return props.active ? "white" : "#444";
  }};
  font-weight: ${props => (props.active || props.isLogout ? "600" : "400")};
  border-left: 5px solid ${props => props.active ? "#4d165a" : "transparent"};

  &:hover {
    background-color: ${props => props.active ? "#702082" : "#f3eaf5"};
    color: ${props => props.isLogout ? "#a71d2a" : (props.active ? "white" : "#702082")};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
`;

const MainCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 500px;
  padding: 20px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: #702082;
  font-weight: bold;
`;


export default function AccountPage({ setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account info");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current session data to verify authentication and get user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get("/sessions");
        setUserData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Not authenticated");
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  // Handle user logout, clear local storage and redirect to login
  const handleLogout = async () => {
    const isConfirmed = await notify.confirm(
          "Log Out",
          "Are you sure you want to log out?"
        );
        
    if (!isConfirmed) return;
    try {
      await logoutUser();
      if (setUser) setUser(null);
      localStorage.removeItem("currentUser");
      navigate("/login");

    } catch (error) {
      console.error("Logout failed", error);
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <h3>Loading your profile...</h3>
      </LoadingWrapper>
    );
  }

  const menuItems = ["Account info", "Interested", "My Products", "Setting", "Log out"];

  // Determine which sub-component to display based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "Account info": return <AccountInfo user={userData} />;
      case "Interested": return <Interested />;
      case "My Products": return <SellingProduct />;
      case "Setting": return <Setting user={userData} />;
      default: return <AccountInfo user={userData} />;
    }
  };

  return (
    <Container>
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>My Profile</SidebarTitle>
          <WelcomeText>Hi, {userData?.name || "User"}</WelcomeText>
        </SidebarHeader>

        <NavList>
          {menuItems.map((item) => {
            const isLogout = item === "Log out";
            const isActive = activeTab === item && !isLogout;

            return (
              <MenuItem
                key={item}
                active={isActive}
                isLogout={isLogout}
                onClick={isLogout ? handleLogout : () => setActiveTab(item)}
              >
                {item}
              </MenuItem>
            );
          })}
        </NavList>
      </Sidebar>

      <ContentArea>
        <MainCard>
          {renderContent()}
        </MainCard>
      </ContentArea>
    </Container>
  );
}