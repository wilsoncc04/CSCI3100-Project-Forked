import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import IndexPage from "./pages/IndexPage";
import ProfilePage from "./pages/ProfilePage";
import ProductInfoPage from "./pages/ProductInfoPage";
import SellPage from "./pages/SellPage";
import MarketplaceFilters from "./common/MarketplaceFilters";

export default function App() {
  const [isSellHovered, setIsSellHovered] = React.useState(false);

  return (
    <BrowserRouter>
      <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        <header style={{ marginBottom: "1rem" }}>
          <h1 style={{ color: "#0066cc" }}>Rails + React (Router) 🚀</h1>
          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ color: "#0066cc", textDecoration: "none" }}>Home</Link>
            <Link to="/about" style={{ color: "#0066cc", textDecoration: "none" }}>About</Link>
            <Link to="/index" style={{ color: "#0066cc", textDecoration: "none" }}>Index</Link>
            <Link to="/Profile" style={{ color: "#0066cc", textDecoration: "none" }}>Profile</Link>
          </nav>

          <nav>
            <h2>CUHK Second-hand Marketplace</h2>
            <p>Welcome to the centralized trading platform for students.</p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <h4>Search Products by:</h4>
              <MarketplaceFilters />
              <Link 
                to="/sell" 
                onMouseEnter={() => setIsSellHovered(true)} 
                onMouseLeave={() => setIsSellHovered(false)}
                style={{ 
                  marginLeft: "auto", 
                  backgroundColor: isSellHovered ? "#cc0000" : "#e60000", 
                  color: "white",
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  padding: "8px 22px",
                  borderRadius: "20px", 
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  boxShadow: isSellHovered 
                    ? "0 4px 12px rgba(230, 0, 0, 0.3)" 
                    : "0 2px 6px rgba(230, 0, 0, 0.2)",
                  transition: "all 0.2s ease"
                }}
              >
                Sell
              </Link>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/index" element={<IndexPage />} />
            <Route path="/Profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductInfoPage />} />
            <Route path="/sell" element={<SellPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}