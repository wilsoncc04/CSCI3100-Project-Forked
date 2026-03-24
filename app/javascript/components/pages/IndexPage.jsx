import React from "react";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch";

export default function IndexPage() {
  const mockProducts = [
    { id: 1, name: "Calculus Textbook", price: 150, condition: "Used" },
    { id: 2, name: "IKEA Desk Lamp", price: 80, condition: "Like New" },
    { id: 3, name: "Muji Stationery Set", price: 30, condition: "New" },
  ];

  return (
    <div className="Index-page-container" style={{ padding: "1rem" }}>
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          backgroundColor: "#f9f9f9",
          border: "1px dashed #ccc",
        }}
      >
        <h3>Market Trends (Selling Quantity Graph)</h3>
        <p style={{ color: "#888" }}>
          [ Bar Chart Component will render here: Textbooks | Furniture |
          Stationary | Snacks ]
        </p>
      </div>
      <FiltersAndSearch />
      <br />
      <br />
      <div>Products</div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {mockProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            condition={product.condition}
          />
        ))}
      </div>
    </div>
  );
}
