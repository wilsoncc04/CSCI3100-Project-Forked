import React, { useState, useEffect } from "react";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch";
import MarketStatChart from "../common/MarketStatChart";

export default function IndexPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chartProducts, setChartProducts] = useState([]);

  useEffect(() => {
    const fetchAllForChart = async () => {
      try {
        const response = await fetch(`/products?fetch_all=true`);
        if (response.ok) {
          const jsonResponse = await response.json();
          setChartProducts(jsonResponse.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch chart data:", err);
      }
    };
    fetchAllForChart();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/products?page=${currentPage}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const jsonResponse = await response.json();
        setProducts(jsonResponse.data);
        if (jsonResponse.pagination) {
          setTotalPages(jsonResponse.pagination.total_pages);
        }
      } catch (err) {
        console.error("Error connecting to server:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <div className="Index-page-container" style={{ padding: "1rem" }}>
      <div
        style={{
          margin: "2rem 0",
          padding: "1rem",
          backgroundColor: "#fff",
          border: "1px dashed #eee",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)"
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>Market Statistics</h3>
        <MarketStatChart products={chartProducts} />
      </div>
      <FiltersAndSearch />
      <br />
      <br />
      <div
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        Products
      </div>
      {isLoading && <p>Loading products...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!isLoading && !error && (
        <>
          <div style={{ display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
            gap: "1.5rem" }}>
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  condition={product.condition}
                  status={product.status || "Available"}
                  images={product.images}
                />
              ))
            )}</div>
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "3rem",
                paddingBottom: "2rem"
              }}>
                <button
                  onClick={() => {
                    setCurrentPage(p => p - 1);
                  }}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    backgroundColor: currentPage === 1 ? "#f0f0f0" : "#fff",
                    color: currentPage === 1 ? "#999" : "#333",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  Previous
                </button>
                <span style={{ fontWeight: "bold", color: "#555" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                  }}
                  disabled={currentPage === totalPages || totalPages === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #0066cc",
                    backgroundColor: (currentPage === totalPages || totalPages === 0) ? "#e6f2ff" : "#0066cc",
                    color: (currentPage === totalPages || totalPages === 0) ? "#99c2ff" : "#fff",
                    cursor: (currentPage === totalPages || totalPages === 0) ? "not-allowed" : "pointer"
                  }}
                >
                  Next
                </button>
              </div>
            )}
        </>
      )}
      
    </div>
  );
}
