import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePicture } from "react-icons/ai";

export default function ProductCard({ id, name, price, condition, status, images }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = images && images.length > 0;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "0",
        width: "200px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "inline-block",
        margin: "10px",
      }}
    >
      <Link to={`/product/${id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            height: "180px",
            backgroundColor: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {hasImage && !imgError ? (
            <img
              src={images[0]}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={() => setImgError(true)}
            />
            ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ccc' }}>
              <AiOutlinePicture size={48} />
              <span style={{ fontSize: '0.7rem', marginTop: '4px' }}>No Image</span>
            </div>
          )}

        </div>
      </Link>

      <div style={{ padding: "12px 12px 16px 12px" }}>
        <h3
          style={{
            fontSize: "1rem",
            margin: "0 0 0.5rem 0",
            color: "#333",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </h3>

        <p
          style={{
            color: "#e60000",
            fontWeight: "bold",
            fontSize: "1.2rem",
            margin: "0 0 0.5rem 0",
          }}
        >
          ${price} HKD
        </p>

        <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
          <span
            style={{
              fontSize: "0.8rem",
              color: "#666",
              backgroundColor: "#f0f0f0",
              padding: "2px 8px",
              borderRadius: "4px",
              textTransform: "capitalize",
            }}
          >
            {status}
          </span>
          {condition ? (
            <span
              style={{
                fontSize: "0.8rem",
                color: "#666",
                backgroundColor: "#f0f0f0",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {condition}
            </span>
          ) : (
            <div style={{ height: "20px" }}></div>
          )}
        </div>
      </div>
    </div>
  );
}
