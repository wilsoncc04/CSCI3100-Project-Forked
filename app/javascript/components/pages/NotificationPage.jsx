import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";


const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #702082;
  border-bottom: 2px solid #702082;
  padding-bottom: 15px;
  margin-bottom: 30px;
  font-weight: 600;
`;

const ChatCard = styled.div`
  padding: 20px;
  background-color: ${props => props.isCancelled ? "#fff5f5" : "#f9f9f9"};
  margin-bottom: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid ${props => props.isCancelled ? "#feb2b2" : "#eee"};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #702082;
  }
`;

const PartnerName = styled.strong`
  display: block;
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LastMessage = styled.p`
  margin: 5px 0;
  color: ${props => props.isError ? "#dc3545" : "#666"};
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${props => props.isError ? "600" : "400"};
`;

const Timestamp = styled.small`
  color: #999;
  display: block;
  margin-top: 10px;
`;

const StatusBadge = styled.span`
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #dc3545;
  color: white;
  text-transform: uppercase;
`;

const LoadingText = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
`;

const EmptyState = styled.p`
  color: #999;
  text-align: center;
  padding: 40px 0;
  font-style: italic;
`;


const NotificationPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Initialize user session and fetch chat list
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userRes = await axios.get("/sessions");
        if (!userRes.data || !userRes.data.id) {
          navigate("/login");
          return;
        }
        setCurrentUser(userRes.data);

        const chatsRes = await axios.get("/chats");
        setChats(chatsRes.data);
      } catch (err) {
        console.error("Auth check failed or fetch error", err);
        navigate("/login"); 
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  if (loading) return <LoadingText>Loading...</LoadingText>;

  return (
    <PageContainer>
      <Title>Messages & Requests ✉️</Title>
      {chats.length > 0 ? (
        chats.map(chat => {
          // Logic: Determine the other party's name
          const partnerName = currentUser.id === chat.seller.id ? chat.buyer.name : chat.seller.name;
          
          // Logic: Check if the last message indicates a cancellation
          const isCancelled = chat.last_message?.includes("has cancelled the trading of");

          return (
            <ChatCard 
              key={chat.id} 
              isCancelled={isCancelled}
              onClick={() => navigate(`/chat?chat_id=${chat.id}`)}
            >
              <PartnerName>
                {partnerName}
                {isCancelled && <StatusBadge>Cancelled</StatusBadge>}
              </PartnerName>
              
              <LastMessage isError={isCancelled}  dangerouslySetInnerHTML={{ __html: chat.last_message || `New request for "${chat.product.name}"`  }} />
              
              <Timestamp>
                {new Date(chat.updated_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Timestamp>
            </ChatCard>
          );
        })
      ) : (
        <EmptyState>No messages yet.</EmptyState>
      )}
    </PageContainer>
  );
};

export default NotificationPage;