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
  AiOutlinePicture,
  AiOutlineEdit,
  AiOutlineDelete
} from "react-icons/ai";
import axios from "axios"; 
import PriceHistoryChart from "../common/PriceHistoryChart";

const ActionButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  font-size: 24px;
  padding: 8px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  /* 新增：處理禁用狀態的視覺反饋 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButtonText = styled.span`
  margin-top: 6px;
  font-size: 0.9rem;
  color: #333;
`;

const PageContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  font-family: sans-serif;
  padding: 0 1rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const StatusBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  background-color: ${(props) => (props.$isBrandNew ? "#e6f2ff" : "#f0f0f0")};
  color: ${(props) => (props.$isBrandNew ? "#0066cc" : "#666")};
  text-transform: capitalize;
`;

const SingleImageWrapper = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 2rem;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: zoom-in;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
`;

const FullImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GridContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  height: 400px;
`;

const MainGridBox = styled.div`
  flex: 2;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: ${(props) => (props.$hasImage ? "zoom-in" : "default")};
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.08);
  }
`;

const SubGridColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SubGridBox = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${(props) => (props.$hasImage ? "zoom-in" : "default")};
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const SubGridImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;

  ${SubGridBox}:hover & {
    transform: scale(1.1);
    filter: brightness(1.1);
  }
`;

const OverlayCount = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 1.2rem;
  font-weight: bold;
  pointer-events: none;
`;

const EmptyText = styled.span`
  color: ${(props) => (props.$isMain ? "#aaa" : "#ddd")};
  font-size: ${(props) => (props.$isMain ? "1rem" : "0.8rem")};
`;

const DetailsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

const InfoSection = styled.div`
  flex: 1;
  padding-right: 2rem;
`;

const ProductName = styled.h1`
  margin: 0 0 0.5rem 0;
  color: #222;
  font-size: 2rem;
`;

const ProductPrice = styled.p`
  font-size: 2rem;
  color: #e60000;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
`;

const ConditionWrapper = styled.p`
  margin: 0 0 1.5rem 0;
`;

const ConditionTag = styled.span`
  background-color: #f0f0f0;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #555;
  font-weight: bold;
`;

const DescriptionWrapper = styled.div`
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #555;
`;

const DescriptionText = styled.p`
  color: #444;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ContactSection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const SellerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
`;

const AvatarCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 20px;
`;

const SellerNameText = styled.p`
  margin: 0;
  font-weight: normal;
  color: #666;
  font-size: 0.95rem;
`;

const ContactInfoList = styled.div`
  font-size: 0.8rem;
  color: #999;
  line-height: 1.6;
`;

const ContactItem = styled.p`
  margin: 0;
`;

const ButtonsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GraphWrapper = styled.div`
  margin: 3rem 0;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  
  h4 {
    margin-bottom: 20px;
    color: #333;
    font-size: 1.1rem;
  }
`;
const GraphArea = styled.div`
  height: 250px;
  position: relative;
  border: none;
  padding: 10px 20px 30px 20px;
`;

const GraphPlaceholder = styled.p`
  position: absolute;
  bottom: 50%;
  left: 40%;
  color: #888;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: #f9f9f9;
  font-size: 40px;
  cursor: pointer;
`;

const ModalNavButton = styled.button`
  position: absolute;
  background: none;
  border: none;
  color: #f9f9f9;
  font-size: 50px;
  cursor: pointer;
  z-index: 10000;
  padding: 20px;
  ${(props) => (props.$direction === "left" ? "left: 5%;" : "right: 5%;")}
`;

const ModalDisplayImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: cover;
  border-radius: 8px;
`;

const LoadingErrorState = styled.div`
  text-align: center;
  margin-top: 50px;
  color: ${(props) => (props.$isError ? "red" : "inherit")};
`;

function extractApiErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }

  return err?.message || fallback;
}


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

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch (e) {
      return null;
    }
  })();

  const localUserId = storedUser?.id;
  
  // 修改 1：判斷是否為「已售出」狀態
  const isSold = product?.status === 'sold';
  
  // 修改 2：判斷是否為「預約中」狀態
  const isReserved = product?.status === 'reserved';
  
  const isOwnProduct = 
    !!product?.is_owner || 
    (localUserId != null && Number(localUserId) === Number(product?.seller_id));
    
  // 修改 3：僅在已售出、或是讀取中、且非本人產品時禁用
  // 按照你的要求：reserved 狀態下按鈕依然要是 open 的
  const isDisabled = !isOwnProduct && (isSold || loading);

  const handleBuyClick = async () => {
    if (!product || isOwnProduct) return;
    
    // 如果已經有人預約，可以換個提示語
    const confirmMsg = isReserved 
      ? `This item is currently reserved. Do you still want to message the seller about "${product.name}"?`
      : `Confirm interest in buying "${product.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await axios.post(`/products/${product.id}/buy`);
      navigate(`/chat?chat_id=${res.data.chat_id}&auto_send=true&product_name=${encodeURIComponent(product.name)}`);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to initiate purchase.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    navigate(`/edit/${product.id}`);
  }

  return (
    <ActionButton 
      onClick={isOwnProduct ? handleEditClick : handleBuyClick}
      disabled={isDisabled}
      title={isOwnProduct ? "You cannot buy your own product." : undefined}
    >
      {/* 圖示邏輯：如果是本人顯示編輯，如果是售出顯示灰色購物車，其餘顯示正常購物車 */}
      {isOwnProduct ? (
        <AiOutlineEdit color="#333" />
      ) : (
        <AiOutlineShoppingCart color={isDisabled ? "#ccc" : "#333"} />
      )}
      
      <ActionButtonText>
        {/* 文字邏輯：本人顯示 Edit，售出顯示 Sold，其餘顯示 Buy */}
        {isOwnProduct ? "Edit" : isSold ? "Sold" : "Buy"}
      </ActionButtonText>
    </ActionButton>
  );
}


export default function ProductInfoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [sellerName, setSellerName] = useState("Anonymous User");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); 

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/sessions");
        if (isMounted) {
          setCurrentUser(response.data);
        }
      } catch (_error) {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProductDetails = async () => {
      setProduct(null); 
      setIsLoading(true);
      setError(null);
      setSellerName("Anonymous User");

      try {
        const response = await axios.get(`/products/${id}`, { signal: controller.signal });
        const data = response.data;
        if (isMounted) {
          setProduct(data);
        }
        
        const sellerId = data.seller_id;
        if (sellerId) {
          try {
            const userResponse = await axios.get(`/users/${sellerId}`, { signal: controller.signal });
            if (isMounted) {
              setSellerName(userResponse.data.name);
            }
          } catch (userErr) {
            if (userErr?.code === "ERR_CANCELED") {
              return;
            }
            console.error("Failed to fetch seller name", userErr);
          }
        }
      } catch (err) {
        if (err?.code === "ERR_CANCELED") {
          return;
        }

        if (isMounted) {
          setError(extractApiErrorMessage(err, "Failed to load product details."));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
      controller.abort();
    };
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

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  const canManageProduct = Boolean(
    product?.can_delete ||
    currentUser?.is_admin === true ||
    (currentUser?.id != null && Number(currentUser.id) === Number(product?.seller_id))
  );

  const handleDeleteProduct = async () => {
    if (!product || isDeleting) {
      return;
    }

    if (!window.confirm(`Delete "${product.name}" permanently?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`/products/${product.id}`);
      alert("Product deleted successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      alert(extractApiErrorMessage(err, "Failed to delete product."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <LoadingErrorState>Loading Product...</LoadingErrorState>;
  if (error) return <LoadingErrorState $isError>Error: {error}</LoadingErrorState>;
  if (!product) return <LoadingErrorState>Product not found</LoadingErrorState>;

  const images = product.images || [];

  return (
    <PageContainer>
      <HeaderContainer>
        <PageTitle>Product Details</PageTitle>
        <StatusBadge $isBrandNew={product.status === "Brand New"}>
          {product.status || "Available"}
        </StatusBadge>
      </HeaderContainer>
        {images.length >= 1 && (
        <>
          {images.length === 1 ? (
            <SingleImageWrapper onClick={() => openModal(0)}>
              <FullImage src={images[0]} alt="Main Photo" />
            </SingleImageWrapper>
          ) : (
            <GridContainer>
              <MainGridBox onClick={() => openModal(0)} $hasImage={images.length > 0}>
                {images[0] ? (
                  <FullImage src={images[0]} alt="Main Photo" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ccc' }}>
                    <AiOutlinePicture size={64} />
                    <span style={{ marginTop: '8px', fontSize: '0.9rem' }}>No Images Uploaded</span>
                  </div>
                )}
              </MainGridBox>

              <SubGridColumn>
                {[1, 2, 3].map((index) => {
                  const isLastVisibleBox = index === 3;
                  const hasMoreImages = images.length > 4;

                  return (
                    <SubGridBox
                      key={index}
                      onClick={() => images[index] && openModal(index)}
                      $hasImage={!!images[index]}
                    >
                      {images[index] ? (
                        <>
                          <SubGridImage src={images[index]} alt={`Detail ${index}`} />
                          {isLastVisibleBox && hasMoreImages && (
                            <OverlayCount>
                              <AiOutlinePicture size={24} /> {images.length} images
                            </OverlayCount>
                          )}
                        </>
                      ) : (
                        <AiOutlinePicture size={32} color="#eee" />
                      )}
                    </SubGridBox>
                  );
                })}
              </SubGridColumn>
            </GridContainer>
          )}
        </>
      )}

      <DetailsContainer>
        <InfoSection>
          <ProductName>{product.name}</ProductName>
          <ProductPrice>${product.price} HKD</ProductPrice>
          <ConditionWrapper>
            <ConditionTag>Condition: {product.condition || "Not Specified"}</ConditionTag>
          </ConditionWrapper>
          
          <DescriptionWrapper>
            <SectionTitle>Description</SectionTitle>
            <DescriptionText>{product.description}</DescriptionText>
          </DescriptionWrapper>

          <ContactSection>
            <SectionTitle>Contact Information</SectionTitle>
            <SellerRow>
              <AvatarCircle>
                <AiOutlineUser />
              </AvatarCircle>
              <SellerNameText>{sellerName}</SellerNameText>
            </SellerRow>

            <ContactInfoList>
              <ContactItem>
                <strong>contact:</strong> {product.contact}
              </ContactItem>
              <ContactItem>
                <strong>Location:</strong> {product.location || "CUHK"}
              </ContactItem>
            </ContactInfoList>
          </ContactSection>
        </InfoSection>

        <ButtonsColumn>
          <LikeButton productId={product.id} initialLiked={product.is_liked} />
          <BuyButton product={product} />
          {canManageProduct && (
            <ActionButton onClick={handleDeleteProduct} disabled={isDeleting}>
              <AiOutlineDelete color={isDeleting ? "#f3a4a4" : "#dc3545"} />
              <ActionButtonText>{isDeleting ? "Deleting..." : "Delete"}</ActionButtonText>
            </ActionButton>
          )}
        </ButtonsColumn>
      </DetailsContainer>

      <GraphWrapper>
        <h4>Price History Graph</h4>
        <GraphArea>
          <PriceHistoryChart productId={product.id} />
        </GraphArea>
      </GraphWrapper>

      {isModalOpen && (
        <ModalOverlay onClick={closeModal}>
          <ModalCloseButton onClick={closeModal}>
            <AiOutlineClose />
          </ModalCloseButton>

          {images.length > 1 && (
            <>
              <ModalNavButton $direction="left" onClick={prevImage}>
                <AiOutlineLeft />
              </ModalNavButton>
              <ModalNavButton $direction="right" onClick={nextImage}>
                <AiOutlineRight />
              </ModalNavButton>
            </>
          )}

          <ModalDisplayImage src={images[currentImageIndex]} alt="Full Screen product image" />
        </ModalOverlay>
      )}
    </PageContainer>
  );
}