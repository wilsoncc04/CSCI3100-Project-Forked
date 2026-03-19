import React, { useState } from "react";

export default function SellPage() {
    const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    contact: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log("Submitting to Rails Backend:", formData);
    alert("Product listed successfully!");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>Sell an Item</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ border: "2px dashed #ccc", padding: "2rem", textAlign: "center", cursor: "pointer" }}>
          Upload Photo (Drag & Drop)
        </div>

        <div>
          <label htmlFor="productName">Product Name</label>
          <input id="productName" type="text" name="productName" value={formData.productName} onChange={handleChange} style={{ width: "100%", padding: "0.5rem" }} required />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: "100%", padding: "0.5rem" }} required />
        </div>

        <div>
          <label htmlFor="price">Price (HKD) $</label>
          <input id="price" type="number" name="price" value={formData.price} onChange={handleChange} style={{ width: "100%", padding: "0.5rem" }} required />
        </div>

        <div>
          <label htmlFor="contact">Contact (Phone or Email)</label>
          <input id="contact" type="text" name="contact" value={formData.contact} onChange={handleChange} style={{ width: "100%", padding: "0.5rem" }} required />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="button" style={{ flex: 1, padding: "0.8rem", backgroundColor: "#ccc", border: "none" }}>Cancel</button>
          <button type="submit" style={{ flex: 1, padding: "0.8rem", backgroundColor: "#0066cc", color: "white", border: "none" }}>Confirm</button>
        </div>
      </form>
    </div>
  );
}