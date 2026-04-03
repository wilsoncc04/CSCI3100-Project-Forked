import React, { useState } from "react";
import { goodsTypes } from "../../common/productConstants"; 
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";

export default function SellPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    contact: "",
    location: "",
    category_id: "",
    condition: "Brand New",
    status: "available",
    promote_to_community: false,
    community_description: "",
  });

  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const conditionOptions = [
    { id: "brand_new", label: "Brand New" },
    { id: "like_new", label: "Like New" },
    { id: "used_good", label: "Used - Good" },
    { id: "heavily_used", label: "Heavily Used" },
  ];

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...newFiles]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false); 
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setImages((prevImages) => [...prevImages, ...newFiles]);
      e.dataTransfer.clearData();
    }
  };

  const handleConditionSelect = (conditionLabel) => {
    setFormData({ ...formData, condition: conditionLabel });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("product[name]", formData.name);
    payload.append("product[description]", formData.description);
    payload.append("product[price]", formData.price);
    payload.append("product[status]", formData.status);
    payload.append("product[condition]", formData.condition);
    payload.append("product[contact]", formData.contact);
    payload.append("product[location]", formData.location || "CUHK");
    const categoryId = goodsTypes.indexOf(formData.category_id) + 1;
    payload.append("product[category_id]", categoryId);
    
    // Community item creation
    if (formData.promote_to_community) {
      payload.append("promote_to_community", "true");
      payload.append("community_description", formData.community_description);
    }
    
    images.forEach((image, index) => {
      payload.append("images[]", image);
    });
    try {
      const response = await fetch("/products", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: payload,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();

        if (response.ok) {
          alert("Product listed successfully!");
          setFormData({
            name: "",
            description: "",
            price: "",
            contact: "",
            location: "",
            category_id: 1,
            condition: "Brand New",
          });
          setImages([]);
        } else if (response.status === 422) {
          alert(`Validation Error: ${data.errors.join(", ")}`);
          {
            const errorData = await response.json();
          }
        } else {
          alert(`Error ${response.status}: ${data.error || "Unknown error"}`);
        }
      } else {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        alert("Server returned HTML instead of JSON. Are you logged in?");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>Sell an Item</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? "2px dashed #0066cc" : "2px dashed #ccc",
            backgroundColor: isDragging ? "#e6f2ff" : "transparent",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            borderRadius: "8px",
            transition: "all 0.2s ease",
          }}
        >
          <label style={{ cursor: "pointer", display: "block", width: "100%", height: "100%" }}>
            <span style={{ color: isDragging ? "#0066cc" : "#444", fontWeight: isDragging ? "bold" : "normal" }}>
              {isDragging ? "Drop images here!" : "Upload Photos (Click or Drag & Drop)"}
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
          {images.length > 0 && <p style={{ marginTop: "10px", color: "#28a745", fontWeight: "bold" }}>{images.length} file(s) selected</p>}
        </div>

        {images.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "10px",
            marginTop: "1rem"
          }}>
            {images.map((file, index) => (
              <div key={index} style={{ position: "relative", paddingTop: "100%" }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd"
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => {
                    setImages(images.filter((_, i) => i !== index));
                  }}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                >
                  <AiOutlineClose size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Product Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Intro to Calculus Textbook"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              outlineColor: "#0066cc",
            }}
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Category (Optional)
          </label>

          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.8rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "white",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: formData.category_id ? "#333" : "#888" }}>
                {formData.category_id || "Select a category"}
              </span>
              <span>{isCategoryOpen ? "▴" : "▾"}</span>
            </button>

            {isCategoryOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  paddingTop: "5px",
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  zIndex: 1000,
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {goodsTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, category_id: type });
                      setIsCategoryOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 15px",
                      border: "none",
                      background:
                        formData.category_id === type ? "#e6f2ff" : "none",
                      color: formData.category_id === type ? "#0066cc" : "#333",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      transition: "background 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor =
                        formData.category_id === type
                          ? "#e6f2ff"
                          : "transparent")
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Condition
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.8rem",
            }}
          >
            {conditionOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => handleConditionSelect(opt.label)}
                style={{
                  width: "100%",
                  padding: "0.8rem 0.5rem",
                  borderRadius: "8px",
                  border:
                    formData.condition === opt.label
                      ? "2px solid #0066cc"
                      : "2px solid #e0e0e0",
                  backgroundColor:
                    formData.condition === opt.label ? "#e6f2ff" : "#fff",
                  color: formData.condition === opt.label ? "#0066cc" : "#555",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Describe the condition, features, or any flaws..."
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              outlineColor: "#0066cc",
              resize: "vertical",
            }}
            required
          />
        </div>

        <div>
          <label
            htmlFor="price"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Price (HKD) $
          </label>
          <input
            id="price"
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            step="0.1"
            min="0"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              outlineColor: "#0066cc",
            }}
            required
          />
        </div>

        <div>
          <label
            htmlFor="contact"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#444",
            }}
          >
            Contact Info (Phone / IG / Email)
          </label>
          <input
            id="contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="How should buyers reach you?"
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
              outlineColor: "#0066cc",
            }}
            required
          />
        </div>

        <div style={{ backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "8px", border: "1px solid #eee" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="promote_to_community"
              checked={formData.promote_to_community}
              onChange={handleCheckboxChange}
            />
            Promote to College Community Board
          </label>
          {formData.promote_to_community && (
            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="community_description" style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Advertisement Description (visible to college members)
              </label>
              <textarea
                id="community_description"
                name="community_description"
                value={formData.community_description}
                onChange={handleChange}
                placeholder="Write a catchy description for your college mates!"
                required
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  minHeight: "80px"
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#e4e4e4")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 4px 6px rgba(0, 102, 204, 0.2)",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0052a3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#0066cc")}
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
