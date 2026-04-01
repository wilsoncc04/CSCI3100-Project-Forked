import React, { useState } from "react";
import { goodsTypes } from "../../common/productConstants"; 
import { useNavigate } from "react-router-dom";

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
  });

  const [images, setImages] = useState([]);

  const conditionOptions = [
    { id: "brand_new", label: "Brand New" },
    { id: "like_new", label: "Like New" },
    { id: "used_good", label: "Used (Good)" },
    { id: "heavily_used", label: "Heavily Used" },
  ];

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleConditionSelect = (conditionLabel) => {
    setFormData({ ...formData, condition: conditionLabel });
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
          style={{
            border: "2px dashed #ccc",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <label style={{ cursor: "pointer", display: "block" }}>
            Upload Photos (Click or Drag & Drop)
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
          {images.length > 0 && <p>{images.length} file(s) selected</p>}
        </div>

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
