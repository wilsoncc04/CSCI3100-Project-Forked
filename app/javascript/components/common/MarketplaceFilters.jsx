import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function MarketplaceFilters() {
  const [isHovered, setIsHovered] = useState(false);

  const panelStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    display: "flex",
    gap: "2rem",
    padding: "1.5rem",
    zIndex: 1000,
    minWidth: "450px",
  };

  const columnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const titleStyle = {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#888",
    marginBottom: "0.5rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px",
  };

  const linkStyle = {
    color: "#333",
    textDecoration: "none",
    fontSize: "0.95rem",
    padding: "4px 0",
  };

  return (
    <div 
      className="filter-container"
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button style={{
        padding: "8px 16px",
        borderRadius: "20px",
        border: "1px solid #ddd",
        backgroundColor: isHovered ? "#f5f5f5" : "white",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px"
      }}>
        Browse Categories <span>{isHovered ? "▴" : "▾"}</span>
      </button>

      {isHovered && (
        <div style={panelStyle}>
          <div style={columnStyle}>
            <div style={titleStyle}>SHOP BY COLLEGE</div>
            <Link to="/search?college=ChungChi" style={linkStyle}>Chung Chi College</Link>
            <Link to="/search?college=NewAsia" style={linkStyle}>New Asia College</Link>
            <Link to="/search?college=United" style={linkStyle}>United College</Link>
            <Link to="/search?college=Shaw" style={linkStyle}>Shaw College</Link>
            <Link to="/search?college=Morningside" style={linkStyle}>Morningside</Link>
            <Link to="/search?college=SHHo" style={linkStyle}>S.H. Ho</Link>
            <Link to="/search?college=CWChu" style={linkStyle}>C.W. Chu</Link>
            <Link to="/search?college=WuYeeSun" style={linkStyle}>Wu Yee Sun</Link>
            <Link to="/search?college=LeeWooSing" style={linkStyle}>Lee Woo Sing</Link>
          </div>

          <div style={columnStyle}>
            <div style={titleStyle}>GOODS TYPE</div>
            <Link to="/search?type=Textbooks" style={linkStyle}>Textbooks & Notes</Link>
            <Link to="/search?type=Electronics" style={linkStyle}>Electronics & Gadgets</Link>
            <Link to="/search?type=Furniture" style={linkStyle}>Furniture & Home</Link>
            <Link to="/search?type=Clothing" style={linkStyle}>Clothing & Accessories</Link>
            <Link to="/search?type=Stationery" style={linkStyle}>Stationery & Supplies</Link>
            <Link to="/search?type=Snacks" style={linkStyle}>Snacks & Food</Link>
            <Link to="/search?type=Others" style={linkStyle}>Others</Link>
          </div>
        </div>
      )}
    </div>
  );
}