import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function LikeButton() {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    // to connect POST /users/interests API
    setLiked(!liked);
    console.log(`Product ${productId} added to interests list`);
  };

  return (
    <button
      onClick={() => setLiked(!liked)}
      style={{
        border: "none",
        background: "none",
        cursor: "pointer",
        fontSize: "24px",
        padding: "8px",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {liked ? <AiFillHeart color="#dc3545" /> : <AiOutlineHeart />}
      <span style={{ marginTop: "6px", fontSize: "0.9rem", color: "#333" }}>
        Interested
      </span>
    </button>
  );
}

function BuyButton() {
  const navigate = useNavigate();

  const handleBuyClick = () => {
    // to call API changing status to "reserved"
    // and trigger Notification for the seller
    console.log(`Initiating buy process for Product ${productId}`);
    navigate(`/chat?product=${productId}`);
  };

  return (
    <button
      style={{
        border: "none",
        background: "none",
        cursor: "pointer",
        fontSize: "24px",
        padding: "8px",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AiOutlineShoppingCart />
      <span style={{ marginTop: "6px", fontSize: "0.9rem", color: "#333" }}>
        Buy
      </span>
    </button>
  );
}

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
        const response = await fetch(`/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
        const sellerId = data.seller_id; 
        if (sellerId) {
          const userResponse = await fetch(`/users/${sellerId}`); 
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setSellerName(userData.name);
          }
        }
      } catch (err) {
        setError(err.message);
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

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  };

  if (isLoading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading Product...</div>;
  if (error) return <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>Error: {error}</div>;
  if (!product) return null;

  const images = product.images || [];

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "sans-serif", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: "#333" }}>Product Details</h2>
        <span style={{ 
          padding: "5px 12px", 
          borderRadius: "20px", 
          fontSize: "0.9rem",
          fontWeight: "bold",
          backgroundColor: product.status === "Brand New" ? "#e6f2ff" : "#f0f0f0",
          color: product.status === "Brand New" ? "#0066cc" : "#666" 
        }}>
          {product.status || "Available"}
        </span>
      </div>
    
      {images.length === 1 ? (
        <div 
          onClick={() => openModal(0)}
          style={{ 
            width: "100%", 
            height: "400px", 
            marginBottom: "2rem", 
            backgroundColor: "#fff", 
            borderRadius: "12px", 
            overflow: "hidden", 
            cursor: "zoom-in", 
            border: "1px solid #f0f0f0", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.04)"
           }}
        >
          <img src={images[0]} alt="Main Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", height: "400px" }}>
          <div 
            onClick={() => openModal(0)}
            style={{ 
              flex: 2, 
              backgroundColor: "#fff", 
              borderRadius: "12px", 
              overflow: "hidden", 
              cursor: images.length > 0 ? "zoom-in" : "default",
              border: "1px solid #f0f0f0",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.04)",
              transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)"; 
              e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.15), 0 8px 16px -8px rgba(0,0,0,0.08)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 30px -10px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.04)";
            }}    
          >
            {images[0] ? (
              <img src={images[0]} alt="Main Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "#aaa" }}>No Image Available</span>
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map((index) => {
              const isLastVisibleBox = index === 3;
              const hasMoreImages = images.length > 4;

              return (
                <div 
                  key={index}
                  onClick={() => images[index] && openModal(index)}
                  style={{ 
                    flex: 1, 
                    backgroundColor: "#fff", 
                    borderRadius: "8px", 
                    overflow: "hidden", 
                    cursor: images[index] ? "zoom-in" : "default",
                    border: "1px solid #f0f0f0",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    position: "relative",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 20px rgba(0,0,0,0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                  }}
                >
                  {images[index] ? (
                    <>
                      <img src={images[index]} alt={`Detail ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.3s ease", cursor: "pointer"}} 
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";   
                            e.currentTarget.style.filter = "brightness(1.1)"; 
                          }} 
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.filter = "brightness(1)";
                          }}/>
                      
                      {isLastVisibleBox && hasMoreImages && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.6)", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                          fontSize: "1.2rem", fontWeight: "bold", pointerEvents: "none"
                        }}>
                          <AiOutlinePicture size={24} /> {images.length} images
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ color: "#ddd", fontSize: "0.8rem" }}>Empty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #eee", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
        <div style={{ flex: 1, paddingRight: "2rem" }}>
          <h1 style={{ margin: "0 0 0.5rem 0", color: "#222", fontSize: "2rem" }}>
            {product.name}
          </h1>
          <p style={{ fontSize: "2rem", color: "#e60000", fontWeight: "bold", margin: "0 0 1.5rem 0" }}>
            ${product.price} HKD
          </p>
          <p style={{ margin: "0 0 1.5rem 0" }}>
            <span style={{ backgroundColor: "#f0f0f0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.9rem", color: "#555",fontWeight: "bold"}}>
              Condition: {product.condition || "Not Specified"}
            </span>
          </p>
          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#555" }}>
              Description
            </h4>
            <p style={{ color: "#444", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {product.description}
            </p>
          </div>

          <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#555" }}>
              Contact Information
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "20px" }}>
                <AiOutlineUser />
              </div>
              <p style={{ margin: 0, fontWeight: "normal", color: "#666", fontSize: "0.95rem" }}>
                {sellerName}
              </p>
            </div>
            
            {/* <p style={{ margin: 0, color: "#0066cc", fontWeight: "bold" }}>{product.contact}</p> */}
            <div style={{ fontSize: "0.8rem", color: "#999", lineHeight: "1.6" }}>
              <p style={{ margin: 0 }}>
                <strong>contact:</strong> {product.contact}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Location:</strong> {product.location || "CUHK"}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <LikeButton productId={product.id} />
          <BuyButton productId={product.id} />
        </div>
      </div>


      <div style={{ margin: "3rem 0", padding: "2rem", border: "1px solid #ddd" }}>
        <h4>Price History Graph</h4>
        <div
          style={{
            height: "200px",
            borderBottom: "2px solid #333",
            borderLeft: "2px solid #333",
            position: "relative",
          }}
        >
          <p
            style={{
              position: "absolute",
              bottom: "50%",
              left: "40%",
              color: "#888",
            }}
          >
            [ Line Chart Component: Date vs Price ]
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div onClick={closeModal} style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 9999,
          cursor: "zoom-out"
        }}>
          <button 
            onClick={closeModal}
            style={{
              position: "absolute", top: "20px", right: "30px",
              background: "none", border: "none", color: "#f9f9f9",
              fontSize: "40px", cursor: "pointer"
            }}
          >
            <AiOutlineClose />
          </button>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                style={{
                  position: "absolute", left: "5%", background: "none", border: "none", color: "#f9f9f9",
                  fontSize: "50px", cursor: "pointer", zIndex: 10000, padding: "20px"
                }}
              >
                <AiOutlineLeft />
              </button>
              <button 
                onClick={nextImage}
                style={{
                  position: "absolute", right: "5%", background: "none", border: "none", color: "#f9f9f9",
                  fontSize: "50px", cursor: "pointer", zIndex: 10000, padding: "20px"
                }}
              >
                <AiOutlineRight />
              </button>
            </>
          )}

          <img 
            src={images[currentImageIndex]} 
            alt="Full Screen product image" 
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "cover", borderRadius: "8px" }} 
          />
        </div>
      )}
    </div>
  );
}