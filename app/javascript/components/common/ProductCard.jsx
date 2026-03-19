import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ id, name, price, condition, image }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", width: "200px" }}>
      <div style={{ height: "150px", backgroundColor: "#f0f0f0", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {"Product Image"}
        {image ? <img src={image} alt={name} style={{ maxWidth: "100%", maxHeight: "100%" }} /> : <span>Photo</span>}
      </div>
      <h3 style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>{name}</h3>
      <p style={{ color: "#e60000", fontWeight: "bold", margin: "0.5rem 0" }}>${price} HKD</p>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>Condition: {condition}</p>
      
      <Link to={`/product/${id}`}>
        <button style={{ width: "100%", padding: "0.5rem", cursor: "pointer", marginTop: "0.5rem" }}>
          View Details
        </button>
      </Link>
    </div>
  );
}