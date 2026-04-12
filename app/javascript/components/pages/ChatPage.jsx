import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { createConsumer } from "@rails/actioncable";


const PageContainer = styled.div`
  display: flex;
  height: 85vh;
  max-width: 1200px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #eee;
`;

const Sidebar = styled.div`
  width: 30%;
  border-right: 1px solid #eee;
  overflow-y: auto;
  background-color: #fafafa;
`;

const ChatListItem = styled.div`
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
  background-color: ${props => props.active ? "#f3eaf5" : "transparent"};
  
  &:hover {
    background-color: #f8f1f9;
  }
`;

const ChatWindow = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
`;

const ChatHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MessageList = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
`;

const MessageBubble = styled.div`
  align-self: ${props => props.isMe ? "flex-end" : "flex-start"};
  margin-bottom: 15px;
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 0.95rem;
  background-color: ${props => props.isMe ? "#702082" : "#e9e9eb"};
  color: ${props => props.isMe ? "#fff" : "#000"};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const ControlPanel = styled.div`
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  border: none;

  &:hover {
    opacity: 0.9;
  }
`;

const ConfirmBtn = styled(ActionButton)`
  background-color: #28a745;
  color: #fff;
`;

const CancelBtn = styled(ActionButton)`
  background-color: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
`;

const InputForm = styled.form`
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border-radius: 25px;
  border: 1px solid #ddd;
  outline: none;
  &:focus {
    border-color: #702082;
  }
`;

const SendButton = styled.button`
  padding: 10px 25px;
  border-radius: 25px;
  background-color: #702082;
  color: #fff;
  border: none;
  font-weight: 600;
  cursor: pointer;
`;

const Badge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
  font-weight: bold;
  background-color: ${props => props.type === 'reserved' ? "#fff3cd" : "#d1ecf1"};
  color: ${props => props.type === 'reserved' ? "#856404" : "#0c5460"};
`;


const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatIdFromUrl = searchParams.get("chat_id");

  const isSeller = currentUser && activeChat && (
    Number(currentUser.id) === Number(activeChat.product.seller_id) || 
    Number(currentUser.id) === Number(activeChat.seller?.id)
  );
  
  const isPrimaryBuyer = activeChat && Number(activeChat.product.buyer_id) === Number(activeChat.buyer.id);

  // Initialize data and handle authentication
  useEffect(() => {
    const initChat = async () => {
      try {
        const userRes = await axios.get("/sessions");
        if (!userRes.data || !userRes.data.id) {
          navigate("/login");
          return;
        }
        setCurrentUser(userRes.data);

        const res = await axios.get("/chats");
        setChats(res.data);
        
        if (chatIdFromUrl) {
          const target = res.data.find(c => c.id.toString() === chatIdFromUrl);
          if (target) setActiveChat(target);
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [chatIdFromUrl, navigate]);

  // Handle WebSocket channel subscription and cleanup
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    fetchMessages(activeChat.id);

    const consumer = createConsumer();
    const subscription = consumer.subscriptions.create(
      { channel: "ChatChannel", chat_id: activeChat.id },
      {
        received(data) {
          setChatHistory((prev) => {
            if (prev.some((msg) => msg.id === data.id)) return prev;
            return [...prev, data];
          });
          setTimeout(scrollToBottom, 50);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [activeChat, currentUser]);

  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`/chats/${id}/messages`);
      setChatHistory(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageContent = customText || inputText.trim();
    if (messageContent === "" || !activeChat) return;

    try {
      await axios.post(`/chats/${activeChat.id}/messages`, {
        message: { message: messageContent }
      });
      if (!customText) setInputText("");
    } catch (err) { 
      console.error("Failed to send message", err); 
    }
  };

  // Finalize the trade between seller and a specific buyer
  const handleFinalConfirm = async (targetBuyerId) => {
    if (!window.confirm("Confirm selling to this buyer? Other chats for this item will be closed.")) return;

    try {
      const res = await axios.patch(`/products/${activeChat.product.id}`, {
        product: { status: 'sold', buyer_id: targetBuyerId }
      });

      if (res.status === 200) {
        alert("Success! Item sold.");
        const updatedProduct = { ...activeChat.product, status: 'sold', buyer_id: targetBuyerId };
        setActiveChat(prev => ({ ...prev, product: updatedProduct }));
        setChats(prev => prev.filter(c => c.product.id !== updatedProduct.id || Number(c.buyer.id) === Number(targetBuyerId)));
        await handleSendMessage(null, "🎊 System: The seller has confirmed the trade. Item SOLD.");
      }
    } catch (err) {
      alert("Error confirming trade");
    }
  };

  // Close the current chat conversation for either seller or buyer
  const handleCancelThisChat = async (chatId) => {
  const partnerName = isSeller ? activeChat.buyer.name : activeChat.seller.name;
  const myName = currentUser.name;
  const productName = activeChat.product.name;

  const confirmMsg = isSeller 
    ? `Reject ${partnerName}? This will notify them and close the chat.` 
    : "Cancel this trade? The seller will be notified.";
  
  if (!window.confirm(confirmMsg)) return;

  try {
    const notificationText = `⚠️ System: ${myName} has cancelled the trading of ${productName}`;
    
    await axios.post(`/chats/${chatId}/messages`, {
      message: { message: notificationText }
    });

    await axios.patch(`/products/${activeChat.product.id}`, {
      action_type: 'cancel_chat',
      chat_id: chatId
    });
    
    setChats(prev => prev.filter(c => c.id !== chatId));
    setActiveChat(null);
    alert("Chat closed successfully.");
  } catch (err) {
    console.error("Error during cancellation:", err);
    alert("Error closing chat");
  }
};

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  
  return (
    <PageContainer>
      <Sidebar>
        {chats.map(chat => (
          <ChatListItem 
            key={chat.id} 
            onClick={() => setActiveChat(chat)}
            active={activeChat?.id === chat.id}
          >
            <div style={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
              {Number(currentUser.id) === Number(chat.seller.id) ? chat.buyer.name : chat.seller.name}
              {chat.product.status === 'reserved' && Number(chat.product.buyer_id) === Number(chat.buyer.id) && 
                <Badge type="reserved">Reserved</Badge>
              }
            </div>
            <div style={{ fontSize: "0.85rem", color: "#666", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "4px" }}>
              {chat.product.name}
            </div>
          </ChatListItem>
        ))}
      </Sidebar>

      <ChatWindow>
        {activeChat ? (
          <>
            <ChatHeader>
              <div>
                Chatting about: <strong>{activeChat.product.name}</strong> 
                <Badge>{activeChat.product.status}</Badge>
                
                {!isSeller && activeChat.product.status === 'reserved' && (
                  <span style={{ marginLeft: "10px", fontSize: "0.9rem", color: isPrimaryBuyer ? "#28a745" : "#fd7e14" }}>
                    {isPrimaryBuyer ? " (Primary Buyer)" : " (Waitlist)"}
                  </span>
                )}
              </div>
            </ChatHeader>

            <MessageList id="chat-container">
              {chatHistory.map((msg) => {
                const isMe = currentUser && Number(msg.sender.id) === Number(currentUser.id);
                return (
                  <MessageBubble key={msg.id} isMe={isMe}>
                    {msg.message}
                  </MessageBubble>
                );
              })}
            </MessageList>

            {/* Trade Controls: Sellers see Confirm/Reject, Buyers see Cancel Trade */}
            {activeChat.product.status !== 'sold' && (
              <ControlPanel>
                {isSeller && (
                  <ConfirmBtn onClick={() => handleFinalConfirm(activeChat.buyer.id)}>
                    Confirm Trade
                  </ConfirmBtn>
                )}
                <CancelBtn onClick={() => handleCancelThisChat(activeChat.id)}>
                  {isSeller ? "Reject Buyer" : "Cancel Trade"}
                </CancelBtn>
              </ControlPanel>
            )}

            <InputForm onSubmit={handleSendMessage}>
              <TextInput 
                type="text" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder="Type a message..." 
              />
              <SendButton type="submit">Send</SendButton>
            </InputForm>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            Select a conversation to start chatting
          </div>
        )}
      </ChatWindow>
    </PageContainer>
  );
};

export default ChatPage;