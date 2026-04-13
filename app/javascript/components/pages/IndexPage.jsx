import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ProductCard from "../common/ProductCard";
import FiltersAndSearch from "../common/FiltersAndSearch";
import MarketStatChart from "../common/MarketStatChart";
import SortDropdown from "../common/SortDropDown";
import { getProducts } from "../../common/productUtils";
import PaginButton from "../common/PaginationButton";

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
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
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

  useEffect(() => {
    const fetchChart = async () => {
      const res = await getProducts({ fetch_all: "true" });
      if (res.data) setChartProducts(res.data);
    };
    fetchChart();
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      setIsLoading(true);
      try {
        const res = await getProducts({ 
          page: currentPage, 
          sort_by: sortOption,
          limit: 15
        });
        
        const available = (res.data || []).filter(p => p.status?.toLowerCase() !== 'sold');
        setProducts(available);
        if (res.pagination) {
          const pages = parseInt(res.pagination.total_pages);
          setTotalPages(!isNaN(pages) ? pages : 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchList();
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

      <PaginButton currentPage={currentPage} totalPages={totalPages} />
    </PageContainer>
  );
}