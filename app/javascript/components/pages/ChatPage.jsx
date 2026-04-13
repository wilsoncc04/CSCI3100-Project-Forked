import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createConsumer } from "@rails/actioncable";
import apiClient from "../../common/apiClient";
import { notify } from "../../common/notify";


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
  &:hover { background-color: #f8f1f9; }
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
  gap: 15px;
`;

const MessageRow = styled.div`
  display: flex;
  flex-direction: ${props => props.isMe ? "row-reverse" : "row"};
  align-items: flex-start;
  gap: 12px;
  width: 100%;
`;

const Avatar = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
  border: 1px solid #e0e0e0;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  font-size: 0.95rem;
  background-color: ${props => props.isMe ? '#D8B4FE' : '#F3F4F6'}; 
  color: ${props => props.isMe ? '#111827' : '#1F2937'};
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  overflow-wrap: break-word;

  ${props => props.isSystem && `
    background-color: #fff5f5;
    color: #c53030;
    border: 1px dashed #feb2b2;
    align-self: center;
    max-width: 90%;
    font-size: 0.85rem;
    margin: 10px 0;
  `}
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
  border: none;
  &:hover { opacity: 0.9; }
`;

const ConfirmBtn = styled(ActionButton)` background-color: #28a745; color: #fff; `;
const CancelBtn = styled(ActionButton)` background-color: #fff; color: #dc3545; border: 1px solid #dc3545; `;

const InputForm = styled.form` padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px; `;
const TextInput = styled.input`
  flex: 1; padding: 12px 20px; border-radius: 25px; border: 1px solid #ddd; outline: none;
  &:focus { border-color: #702082; }
`;

const SendButton = styled.button`
  padding: 10px 25px; border-radius: 25px; background-color: #702082; color: #fff; border: none; font-weight: 600;
`;

const Badge = styled.span`
  font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-weight: bold;
  background-color: ${props => props.color || "#d1ecf1"}; color: ${props => props.textColor || "#0c5460"};
`;

const StatusBanner = styled.div`
  padding: 15px; text-align: center; font-weight: 600; border-top: 1px solid;
  background-color: ${props => props.isCancel ? "#fff5f5" : "#f0fff4"};
  color: ${props => props.isCancel ? "#c53030" : "#276749"};
  border-color: ${props => props.isCancel ? "#feb2b2" : "#c6f6d5"};
`;

const getBaseUrl = () => {
  return window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : window.location.origin;
};


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

  const isTradeCancelled = (chat) => chat?.last_message?.includes("has cancelled the trade");

  const isSeller = currentUser && activeChat && (
    Number(currentUser.id) === Number(activeChat.product.seller_id) || 
    Number(currentUser.id) === Number(activeChat.seller?.id)
  );

  useEffect(() => {
    const initChat = async () => {
      try {
        const userRes = await apiClient.get("/sessions");
        if (!userRes.data?.id) { navigate("/login"); return; }
        setCurrentUser(userRes.data);

        const res = await apiClient.get("/chats");
        setChats(res.data);
        if (chatIdFromUrl) {
          const target = res.data.find(c => c.id.toString() === chatIdFromUrl);
          if (target) setActiveChat(target);
        }
      } catch (err) { navigate("/login"); } finally { setLoading(false); }
    };
    initChat();
  }, [chatIdFromUrl, navigate]);

  useEffect(() => {
  if (!activeChat || !currentUser) return;
  fetchMessages(activeChat.id);

  const consumer = createConsumer();
  const subscription = consumer.subscriptions.create(
    { channel: "ChatChannel", chat_id: activeChat.id },
    {
      received(data) {
        // update chat history with new message, but only if it's not already included (to prevent duplicates)
        setChatHistory((prev) => {
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });

        const isConfirmMsg = data.message.includes("confirmed the trade");
        const isCancelMsg = data.message.includes("cancelled the trade");

        setChats(prev => prev.map(c => {
          if (c.id === activeChat.id) {
            return { 
              ...c, 
              last_message: data.message,
              product: { 
                ...c.product, 
                status: isConfirmMsg ? 'sold' : c.product.status 
              }
            };
          }
          return c;
        }));

        setActiveChat(prev => {
          if (prev?.id === activeChat.id) {
            return { 
              ...prev, 
              last_message: data.message,
              product: { 
                ...prev.product, 
                status: isConfirmMsg ? 'sold' : prev.product.status 
              }
            };
          }
          return prev;
        });

        setTimeout(scrollToBottom, 50);
      }
    }
  );
  return () => { subscription.unsubscribe(); consumer.disconnect(); };
}, [activeChat?.id, currentUser]);

  const fetchMessages = async (id) => {
    try {
      const res = await apiClient.get(`/chats/${id}/messages`);
      setChatHistory(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
  };

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    if (isTradeCancelled(activeChat)) return;

    const messageContent = customText || inputText.trim();
    if (messageContent === "" || !activeChat) return;

    try {
      await apiClient.post(`/chats/${activeChat.id}/messages`, {
        message: { message: messageContent }
      });
      if (!customText) setInputText("");
    } catch (err) { console.error(err); }
  };

  const handleConfirmTrade = async (chatId) => {
  const isConfirmed = await notify.confirm(
    "Confirm Sale?", 
    "This will mark the item as SOLD. The chat will remain for your records."
  );
  if (!isConfirmed) return;

  const notificationText = `🎉 System: ${currentUser.name} has confirmed the trade.`;

  try {
    // send system message to chat
    await apiClient.post(`/chats/${chatId}/messages`, {
      message: { message: `🎉 System: ${currentUser.name} has confirmed the trade.` }
    });

    await apiClient.patch(`/products/${activeChat.product.id}`, {
      product: { 
        status: 'sold',
        buyer_id: activeChat.interested_id
      } 
    });

    notify.success("Trade confirmed!");
    
    setActiveChat(prev => ({
      ...prev,
      product: { ...prev.product, status: 'sold' }
    }));
    
    setChats(prev => prev.map(c => 
      c.id === chatId 
      ? { ...c, product: { ...c.product, status: 'sold' } } 
      : c
    ));
  } catch (err) {
    console.error(err);
  }
};

  const handleCancelThisChat = async (chatId) => {
    const isConfirmed = await notify.confirm(
      isSeller ? "Reject Buyer?" : "Cancel Trade?", 
      "Trade will be closed immediately."
    );
    if (!isConfirmed) return;

    const notificationText = `⚠️ System: ${currentUser.name} has cancelled the trade`;
    
    // UI Instant Lock
    setActiveChat(prev => ({ ...prev, last_message: notificationText }));
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, last_message: notificationText } : c));

    try {
      await apiClient.post(`/chats/${chatId}/messages`, {
        message: { message: notificationText }
      });
      await apiClient.patch(`/products/${activeChat.product.id}`, {
        action_type: 'cancel_chat',
        chat_id: chatId
      });
      notify.success("Trade closed.");
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  const activeCancelled = isTradeCancelled(activeChat);
  const activeSold = activeChat?.product?.status === 'sold';
  const isReadOnly = activeCancelled || activeSold;

  return (
    <PageContainer>
      <Sidebar>
        {chats.map(chat => (
          <ChatListItem key={chat.id} onClick={() => setActiveChat(chat)} active={activeChat?.id === chat.id}>
            <div style={{ fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{Number(currentUser.id) === Number(chat.seller.id) ? chat.buyer.name : chat.seller.name}</span>
              {isTradeCancelled(chat) && <Badge color="#fed7d7" textColor="#9b2c2c">Cancelled</Badge>}
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
                <Badge color={activeSold ? "#c6f6d5" : "#e2e8f0"} textColor={activeSold ? "#22543d" : "#4a5568"}>
                  {activeChat.product.status.toUpperCase()}
                </Badge>
              </div>
            </ChatHeader>

            <MessageList id="chat-container">
              {chatHistory.map((msg) => {
                const isMe = currentUser && Number(msg.sender.id) === Number(currentUser.id);
                const isSystemMsg = msg.message.includes("System:");
                
                // Use User-uploaded profile_picture_url (now provided by Model as_json)
                // Fallback to UI-Avatars API
                const rawUrl = msg.sender.profile_picture_url;
                const avatarSrc = rawUrl 
                  ? (rawUrl.startsWith('http') ? rawUrl : `${getBaseUrl()}${rawUrl}`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}&background=random&color=fff`;

                return (
                  <MessageRow key={msg.id} isMe={isMe}>
                    {!isSystemMsg && (
                      <Avatar src={avatarSrc} alt={msg.sender.name} />
                    )}
                    <MessageBubble isMe={isMe} isSystem={isSystemMsg} dangerouslySetInnerHTML={{ __html: msg.message }} />
                  </MessageRow>
                 );
              })}
            </MessageList>

            {!isReadOnly ? (
              <>
                <ControlPanel>
                  {isSeller ? (
              <>
                {/* for seller only */}
                  <ConfirmBtn onClick={() => handleConfirmTrade(activeChat.id)}>
                    Confirm Sale
                  </ConfirmBtn>
      
                  <CancelBtn onClick={() => handleCancelThisChat(activeChat.id)}>
                    Reject Buyer
                  </CancelBtn>
              </>
                ) : (
                  /* for buyer only */
                  <CancelBtn onClick={() => handleCancelThisChat(activeChat.id)}>
                    Cancel Trade
                  </CancelBtn>
              )}
                </ControlPanel>
                <InputForm onSubmit={handleSendMessage}>
                  <TextInput type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." />
                  <SendButton type="submit">Send</SendButton>
                </InputForm>
              </>
            ) : (
              <StatusBanner isCancel={activeCancelled}>
                {activeCancelled ? "This conversation has been closed (Cancelled)." : "This item has been sold. Chat archived."}
              </StatusBanner>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>Select a conversation</div>
        )}
      </ChatWindow>
    </PageContainer>
  );
};

export default ChatPage;