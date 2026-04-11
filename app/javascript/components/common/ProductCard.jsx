import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePicture } from "react-icons/ai";
import getTimesAgo from "../../common/getTimesAgo";
import styled from "styled-components";
import { StatusBadge, ConditionTag } from "../../common/style";

export default function ProductCard({ id, name, price, condition, status, images, created_at }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = images && images.length > 0;

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    let bg = "#d4edda", color = "#155724";
    if (s === "sold") { bg = "#e9ecef"; color = "#6c757d"; }
    if (s === "reserved") { bg = "#fff3cd"; color = "#856404"; }
    return { backgroundColor: bg, color: color };
  };

  const statusStyle = getStatusStyle(status);

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
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          backgroundColor: "rgba(34, 34, 34, 0.44)",
          color: "#fff",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.7rem",
          zIndex: "10", 
          pointerEvents: "none", 
        }}
      >
        {getTimesAgo(created_at)}
      </div>

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
              fontWeight: "600",
              ...statusStyle,
            }}
          >
            {status}
          </span>
          {condition ? (
            <ConditionTag
              $condition={condition}
              style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px" }}
            >
              {condition}
            </ConditionTag>
          ) : (
            <div style={{ height: "20px" }}></div>
          )}
        </div>
      </div>
    </div>
  );
}
