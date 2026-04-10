import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch"; 
import SortDropdown from "../common/SortDropDown";

const PageContainer = styled.div`
  padding: 1rem;
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
`;

const ResultsContent = styled.div`
  min-height: 60vh;
  position: relative;
  
  opacity: ${props => (props.$isLoading ? 0.5 : 1)};
  transition: opacity 0.3s ease;
`;

const LoadingOverlay = styled.p`
  position: absolute;
  top: -20px;
  left: 0;
  color: #2563eb;
  font-weight: 500;
  margin: 0;
`;

const ResultsList = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const ErrorText = styled.p`
  color: red;
`;

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

        if (isActive) {
          const searchResults = (Array.isArray(data?.data) ? data.data : []).filter(
            p => p.status?.toLowerCase() !== 'sold'
          );
          setProducts(searchResults);
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Search error:", error);
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
    <PageContainer>
      <FilterSection>
        <FiltersAndSearch />
      </FilterSection>
      
      <ResultsHeader>
        <Title>Search Results</Title>
        <SortDropdown />
      </ResultsHeader>
      
      <ResultsContent $isLoading={isLoading}>
        {isLoading && <LoadingOverlay>Updating results...</LoadingOverlay>}
        
        {error && <ErrorText>{error}</ErrorText>}

        <ResultsList>
          {products.length === 0 && !isLoading ? (
            <p>No products match your criteria. Try different filters!</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))
          )}
        </ResultsList>
      </ResultsContent>
    </PageContainer>
  );
}