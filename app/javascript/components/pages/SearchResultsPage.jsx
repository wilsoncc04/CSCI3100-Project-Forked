import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch"; 

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryStr = searchParams.toString();
        const url = `/products${queryStr ? `?${queryStr}` : ""}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch search results.");
        }

        const products = await response.json();

        setProducts(products.data || []);
      } catch (error) {
        console.error("Some errors occurred:", error);
        setError("Failed to fetch search results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <FiltersAndSearch />
      </div>
      <h2>Search Results</h2>
      {isLoading ? <p>Loading...</p> : null}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!isLoading && !error && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {products.length === 0 ? (
            <p>No products match your criteria. Try different filters!</p>
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
          )}
        </div>
      )}
    </div>
  );
}
