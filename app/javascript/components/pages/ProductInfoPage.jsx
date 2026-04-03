import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShoppingCart,
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlinePicture
} from "react-icons/ai";
import axios from "axios";

// --- 1. 樣式定義 (採用 Stashed changes 的美化版本) ---
const PageContainer = styled.div` max-width: 900px; margin: 2rem auto; font-family: sans-serif; padding: 0 1rem; `;
const HeaderContainer = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; `;
const PageTitle = styled.h2` margin: 0; color: #333; `;
const StatusBadge = styled.span`
  padding: 5px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: bold;
  background-color: ${(props) => (props.$isBrandNew ? "#e6f2ff" : "#f0f0f0")};
  color: ${(props) => (props.$isBrandNew ? "#0066cc" : "#666")};
`;

const SingleImageWrapper = styled.div`
  width: 100%; height: 400px; margin-bottom: 2rem; background-color: #fff;
  border-radius: 12px; overflow: hidden; cursor: zoom-in; border: 1px solid #f0f0f0;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
`;

const FullImage = styled.img` width: 100%; height: 100%; object-fit: cover; `;
const GridContainer = styled.div` display: flex; gap: 1rem; margin-bottom: 2rem; height: 400px; `;
const MainGridBox = styled.div`
  flex: 2; background-color: #fff; border-radius: 12px; overflow: hidden;
  cursor: ${(props) => (props.$hasImage ? "zoom-in" : "default")};
  border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  &:hover { transform: translateY(-5px); }
`;

const SubGridColumn = styled.div` flex: 1; display: flex; flex-direction: column; gap: 1rem; `;
const SubGridBox = styled.div`
  flex: 1; background-color: #fff; border-radius: 8px; overflow: hidden;
  cursor: ${(props) => (props.$hasImage ? "zoom-in" : "default")};
  border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center;
  position: relative;
`;

const SubGridImage = styled.img` 
  width: 100%; height: 100%; object-fit: cover; 
  &:hover { transform: scale(1.1); filter: brightness(1.1); transition: all 0.3s; }
`;

const OverlayCount = styled.div`
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); color: white;
  display: flex; align-items: center; justify-content: center; gap: 5px;
  font-size: 1.2rem; font-weight: bold; pointer-events: none;
`;

const DetailsContainer = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  background-color: #fff; padding: 2rem; border-radius: 12px; border: 1px solid #eee;
`;

const ActionButton = styled.button`
  border: none; background: none; cursor: pointer; font-size: 24px; padding: 8px;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ActionButtonText = styled.span` margin-top: 6px; font-size: 0.9rem; color: #333; font-weight: 500; `;

// --- 2. 子組件 (整合邏輯與樣式) ---

function LikeButton({ productId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleLike = async () => {
    try {
      const res = await axios.post(`/products/${productId}/interest`);
      setLiked(res.data.status === 'liked');
    } catch (err) {
      alert("Please login first.");
    }
  };

  return (
    <ActionButton onClick={handleLike}>
      {liked ? <AiFillHeart color="#dc3545" /> : <AiOutlineHeart />}
      <ActionButtonText>Interested</ActionButtonText>
    </ActionButton>
  );
}

function BuyButton({ product }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBuyClick = async () => {
    if (!product) return;
    if (!window.confirm(`Confirm interest in buying "${product.name}"?`)) return;

    setLoading(true);
    try {
      const res = await axios.post(`/products/${product.id}/buy`);
      // 跳轉至聊天室並帶入自動訊息參數
      navigate(`/chat?chat_id=${res.data.chat_id}&auto_send=true&product_name=${encodeURIComponent(product.name)}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to initiate purchase.");
    } finally {
      setLoading(false);
    }
  };

  const isReserved = product?.status === 'reserved' || product?.status === 'sold';

  return (
    <ActionButton onClick={handleBuyClick} disabled={isReserved || loading}>
      <AiOutlineShoppingCart color={isReserved ? "#ccc" : "#333"} />
      <ActionButtonText>{isReserved ? "Reserved" : "Buy"}</ActionButtonText>
    </ActionButton>
  );
}

// --- 3. 主頁面組件 ---

export default function ProductInfoPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerName, setSellerName] = useState("Anonymous User");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`/products/${id}`);
        const data = response.data;
        setProduct(data);

        if (data.seller_id) {
          try {
            const userResponse = await axios.get(`/users/${data.seller_id}`);
            setSellerName(userResponse.data.name);
          } catch (userErr) {
            console.error("Failed to fetch seller name", userErr);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  const images = product?.images || [];

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>Error: {error}</div>;
  if (!product) return null;

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>Product Details</PageTitle>
        <StatusBadge $isBrandNew={product.status === "Brand New"}>
          {product.status || "Available"}
        </StatusBadge>
      </HeaderContainer>

      {/* 圖片展示區域 */}
      {images.length === 1 ? (
        <SingleImageWrapper onClick={() => openModal(0)}>
          <FullImage src={images[0]} alt="Main Photo" />
        </SingleImageWrapper>
      ) : (
        <GridContainer>
          <MainGridBox onClick={() => openModal(0)} $hasImage={images.length > 0}>
            {images[0] ? <FullImage src={images[0]} /> : <span>No Image</span>}
          </MainGridBox>
          <SubGridColumn>
            {[1, 2, 3].map((index) => (
              <SubGridBox key={index} onClick={() => images[index] && openModal(index)} $hasImage={!!images[index]}>
                {images[index] && <SubGridImage src={images[index]} />}
                {index === 3 && images.length > 4 && (
                  <OverlayCount><AiOutlinePicture /> {images.length} images</OverlayCount>
                )}
              </SubGridBox>
            ))}
          </SubGridColumn>
        </GridContainer>
      )}

      {/* 詳細資訊區域 */}
      <DetailsContainer>
        <div style={{ flex: 1, paddingRight: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem 0" }}>{product.name}</h1>
          <p style={{ fontSize: "2rem", color: "#e60000", fontWeight: "bold", margin: "0 0 1.5rem 0" }}>
            ${product.price} HKD
          </p>
          <div style={{ marginBottom: "1rem" }}>
            <p><strong>Condition:</strong> {product.condition || "Not Specified"}</p>
            <p style={{ whiteSpace: "pre-wrap", color: "#444" }}>{product.description}</p>
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AiOutlineUser />
              </div>
              <p style={{ margin: 0 }}>{sellerName}</p>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "10px" }}>
              Contact: {product.contact} | Location: {product.location || "CUHK"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <LikeButton productId={product.id} initialLiked={product.is_liked} />
          <BuyButton product={product} />
        </div>
      </DetailsContainer>

      {/* 燈箱視窗 */}
      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <AiOutlineClose style={{ position: "absolute", top: "20px", right: "30px", color: "#fff", fontSize: "40px", cursor: "pointer" }} />
          <img src={images[currentImageIndex]} style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }} alt="Product" />
        </ModalOverlay>
      )}
    </PageContainer>
  );
}

// 燈箱背景樣式
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: rgba(0, 0, 0, 0.9); display: flex; justify-content: center;
  align-items: center; z-index: 9999;
`;