import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch"; 

function parseSearchApiError(response, data) {
  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }

  return `Failed to fetch search results (${response.status}).`;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryStr = searchParams.toString();
        const url = `/products${queryStr ? `?${queryStr}` : ""}`;
        const response = await fetch(url, {
          signal: controller.signal,
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        const isJson = (response.headers.get("content-type") || "").includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          throw new Error(parseSearchApiError(response, data));
        }

        if (!isActive) {
          return;
        }

        setProducts(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Some errors occurred:", error);
        if (isActive) {
          setProducts([]);
          setError(error.message || "Failed to fetch search results.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();

    return () => {
      isActive = false;
      controller.abort();
    };
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
