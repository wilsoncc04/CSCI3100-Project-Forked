import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get("/products/selling", {
        withCredentials: true
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`/products/${id}`, {
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        }
      });
      // 從 UI 中移除
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading your items...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h2 style={{ color: "#702082", borderBottom: "2px solid #702082", paddingBottom: "10px" }}>
        On-Selling Products
      </h2>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
            <th style={thStyle}>Item Name</th>
            <th style={thStyle}>Price (HKD)</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                You haven't listed any products yet.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: "bold" }}>{product.name}</div>
                  {product.images && product.images.length > 0 && (
                    <img 
                      src={product.images[0]} 
                      alt="thumb" 
                      style={{ width: "50px", height: "50px", objectFit: "cover", marginTop: "5px", borderRadius: "4px" }} 
                    />
                  )}
                </td>

                <td style={tdStyle}>${product.price}</td>

                <td style={tdStyle}>
                  <span style={statusBadge(product.status)}>{product.status}</span>
                </td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* 隊友建議：直接跳轉到 SellPage 的編輯模式 */}
                    <button 
                      onClick={() => navigate(`/edit/${product.id}`)} 
                      style={editButtonStyle}
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: "15px", borderBottom: "2px solid #ddd", color: "#555" };
const tdStyle = { padding: "15px" };

const editButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "white",
  color: "#702082",
  border: "1px solid #702082",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold"
};

const deleteButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold"
};

const statusBadge = (status) => {
  const s = status?.toLowerCase();
  let bg = "#d4edda", color = "#155724";
  if (s === "sold") { bg = "#e9ecef"; color = "#6c757d"; }
  if (s === "reserved") { bg = "#fff3cd"; color = "#856404"; }
  
  return {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    backgroundColor: bg,
    color: color,
    textTransform: "capitalize"
  };
};