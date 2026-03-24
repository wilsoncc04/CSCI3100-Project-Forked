import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import AccountPage from "./pages/AccountPage";
import ProductInfoPage from "./pages/ProductInfoPage";
import SellPage from "./pages/SellPage";

export default function App() {
  const [isSellHovered, setIsSellHovered] = React.useState(false);

  return (
    <BrowserRouter>
      <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
        <header style={{ marginBottom: "1rem" }}>
          <nav> 
            <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
              <div> 
                <h2>CUHK Second-hand Marketplace</h2>
                <p>Welcome to the centralized trading platform for students.</p>
              </div>
            </Link>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
              <Link to="/Account" style={{ color: "#0066cc", textDecoration: "none" }}>Account</Link>
            </div>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/Account" element={<AccountPage />} />
            <Route path="/product/:id" element={<ProductInfoPage />} />
            <Route path="/sell" element={<SellPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
