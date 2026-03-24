import React from "react";
import { useParams } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart, AiOutlineShoppingCart } from 'react-icons/ai';
import { useState } from 'react';

function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button 
      onClick={() => setLiked(!liked)}
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        padding: '8px',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {liked ? <AiFillHeart color="#dc3545" /> : <AiOutlineHeart />}
      <span style={{ marginTop: '6px', fontSize: '0.9rem', color: '#333' }}>Interested</span>
    </button>
  );
}

function BuyButton() {
  return (
    <button 
      style={{
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        padding: '8px',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AiOutlineShoppingCart />
      <span style={{ marginTop: '6px', fontSize: '0.9rem', color: '#333' }}>Buy</span>
    </button>
  );
}

export default function ProductInfoPage() {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>Product Details (ID: {id})</h2>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ width: "300px", height: "300px", backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>Main Photo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ width: "90px", height: "90px", backgroundColor: "#eee" }}></div>
          <div style={{ width: "90px", height: "90px", backgroundColor: "#eee" }}></div>
          <div style={{ width: "90px", height: "90px", backgroundColor: "#eee" }}></div>
        </div>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3>Product Name Placeholder</h3>
          <p style={{ fontSize: "1.5rem", color: "#e60000", fontWeight: "bold" }}>$150 HKD</p>
          <p><strong>Description:</strong> A very detailed description of the item goes here.</p>
          <p><strong>Contact:</strong> User_Email@link.cuhk.edu.hk</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <LikeButton />
          <BuyButton />
        </div>
      </div>
      <div style={{ margin: "3rem 0", padding: "2rem", border: "1px solid #ddd" }}>
        <h4>Price History Graph</h4>
        <div style={{ height: "200px", borderBottom: "2px solid #333", borderLeft: "2px solid #333", position: "relative" }}>
           <p style={{ position: "absolute", bottom: "50%", left: "40%", color: "#888" }}>[ Line Chart Component: Date vs Price ]</p>
        </div>
      </div>
    </div>
  );
}