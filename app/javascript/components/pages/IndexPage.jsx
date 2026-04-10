import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch";
import MarketStatChart from "../common/MarketStatChart";
import SortDropdown from "../common/SortDropDown";

const PageContainer = styled.div`
  padding: 1rem;
`;

const ChartSection = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background-color: #fff;
  border: 1px dashed #eee;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const ProductSection = styled.div`
  min-height: 60vh; 
  position: relative;
  transition: opacity 0.3s ease;
  
  opacity: ${props => (props.$isLoading ? 0.5 : 1)};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 0.9rem;
  color: #2563eb;
  font-weight: 500;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding-bottom: 2rem;
`;

const PageInfo = styled.span`
  font-weight: bold;
  color: #555;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  font-size: 0.9rem;

  ${props => props.$isPrimary 
    ? `
      border: 1px solid #0066cc;
      background-color: ${props.disabled ? "#e6f2ff" : "#0066cc"};
      color: ${props.disabled ? "#99c2ff" : "#fff"};
    `
    : `
      border: 1px solid #ccc;
      background-color: ${props.disabled ? "#f0f0f0" : "#fff"};
      color: ${props.disabled ? "#999" : "#333"};
    `
  }

  &:hover {
    ${props => !props.disabled && "opacity: 0.8;"}
  }
`;

const ErrorText = styled.p`
  color: red;
`;

export default function IndexPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [chartProducts, setChartProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const sortOption = searchParams.get("sort_by") || "default";

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

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
        const response = await fetch(`/products?page=${currentPage}&sort_by=${sortOption}`);
        if (!response.ok) throw new Error("Failed to fetch products");

        const jsonResponse = await response.json();
          const availableProducts = (jsonResponse.data || []).filter(
        p => p.status?.toLowerCase() !== 'sold'
      );
        setProducts(availableProducts);
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
  }, [currentPage, sortOption]);

  return (
    <PageContainer>
      <ChartSection>
        <ChartTitle>Market Statistics</ChartTitle>
        <MarketStatChart products={chartProducts} />
      </ChartSection>

      <FiltersAndSearch />
      
      <br /><br />

      <SectionHeader>
        <SectionTitle>Products</SectionTitle>
        <SortDropdown />
      </SectionHeader>

      <ProductSection $isLoading={isLoading}>
        {isLoading && <LoadingOverlay>Loading products...</LoadingOverlay>}
        {error && <ErrorText>Error: {error}</ErrorText>}

          <ProductGrid>
            {products.length === 0 && !isLoading ? (
              <p>No products found.</p>
            ) : (
              products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </ProductGrid>
      </ProductSection>

      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </PaginationButton>
          
          <PageInfo>
            Page {currentPage} of {totalPages}
          </PageInfo>
          
          <PaginationButton
            $isPrimary
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </PaginationButton>
        </PaginationContainer>
      )}
    </PageContainer>
  );
}