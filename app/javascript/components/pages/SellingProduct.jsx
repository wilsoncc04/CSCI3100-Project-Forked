import React, { useState } from "react";

export default function SellingProducts() {

  const [products, setProducts] = useState([
    { id: 1, name: "Textbook: CS101", amount: 1, price: 150, status: "Available" },
    { id: 2, name: "iPhone 13 Case", amount: 5, price: 20, status: "Reserved" },
    { id: 3, name: "Desk Lamp", amount: 1, price: 50, status: "Available" },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = (id) => {
    setProducts(products.map(p => p.id === id ? editForm : p));
    setEditingId(null);
    console.log("Saving product:", editForm);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ color: "#702082", borderBottom: "2px solid #702082", paddingBottom: "10px" }}>
        On-Selling Products
      </h2>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
            <th style={thStyle}>Item Name</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Price (HKD)</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>{product.name}</td>
              
              {/* 數量單元格 */}
              <td style={tdStyle}>
                {editingId === product.id ? (
                  <input 
                    type="number" 
                    style={inputStyle}
                    value={editForm.amount} 
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                  />
                ) : product.amount}
              </td>

              {/* 價格單元格 */}
              <td style={tdStyle}>
                {editingId === product.id ? (
                  <input 
                    type="number" 
                    style={inputStyle}
                    value={editForm.price} 
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  />
                ) : `$${product.price}`}
              </td>

              {/* 狀態單元格 */}
              <td style={tdStyle}>
                {editingId === product.id ? (
                  <select 
                    style={inputStyle}
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value={product.status}>{product.status} (Current)</option>
                    <option value="Sold">Sold</option>
                  </select>
                ) : (
                  <span style={statusBadge(product.status)}>{product.status}</span>
                )}
              </td>

              {/* 操作按鈕 */}
              <td style={tdStyle}>
                {editingId === product.id ? (
                  <button onClick={() => handleSave(product.id)} style={saveButtonStyle}>Save</button>
                ) : (
                  <button onClick={() => startEdit(product)} style={editButtonStyle}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Styles ---
const thStyle = { padding: "15px", borderBottom: "2px solid #ddd", color: "#555" };
const tdStyle = { padding: "15px" };
const inputStyle = { width: "70px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" };

const editButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "white",
  color: "#702082",
  border: "1px solid #702082",
  borderRadius: "4px",
  cursor: "pointer"
};

const saveButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

const statusBadge = (status) => ({
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: "bold",
  backgroundColor: status === "Sold" ? "#e9ecef" : status === "Reserved" ? "#fff3cd" : "#d4edda",
  color: status === "Sold" ? "#6c757d" : status === "Reserved" ? "#856404" : "#155724"
});