import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import ProductCard from "../common/ProductCard";

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #530662;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const CollegeFilter = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #530662;
  background: ${props => props.active ? '#530662' : 'white'};
  color: ${props => props.active ? 'white' : '#530662'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #702082;
    color: white;
  }
`;

const CommunityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
`;

const CommunityItemCard = styled.div`
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AdvertiseDescription = styled.div`
  font-style: italic;
  color: #444;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #530662;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const AuthorInfo = styled.div`
  font-size: 0.85rem;
  color: #888;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CollegeTag = styled.span`
  background: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
`;

const COLLEGES = [
  "All",
  "Chung Chi College",
  "New Asia College",
  "United College",
  "Shaw College",
  "Morningside College",
  "S.H. Ho College",
  "C.W. Chu College",
  "Wu Yee Sun College",
  "Lee Woo Sing College"
];

export default function CommunityPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState("All");

  useEffect(() => {
    fetchCommunityItems();
  }, [selectedCollege]);

  const fetchCommunityItems = async () => {
    setLoading(true);
    try {
      const url = selectedCollege === "All" 
        ? "/community_items" 
        : `/community_items?college=${encodeURIComponent(selectedCollege)}`;
      const res = await axios.get(url);
      const activeItems = (Array.isArray(res.data) ? res.data : []).filter(
      item => item.product?.status?.toLowerCase() !== 'sold'
    );
      setItems(activeItems);
    } catch (err) {
      console.error("Failed to fetch community items", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <HeaderSection>
        <Title>College Community Board</Title>
        <Subtitle>Promote your products to your college members!</Subtitle>
      </HeaderSection>

      <CollegeFilter>
        {COLLEGES.map(college => (
          <FilterButton 
            key={college} 
            active={selectedCollege === college}
            onClick={() => setSelectedCollege(college)}
          >
            {college}
          </FilterButton>
        ))}
      </CollegeFilter>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading community posts...</p>
      ) : (
        <CommunityGrid>
          {items.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>No advertisements found for this college.</p>
          ) : (
            items.map(item => (
              <CommunityItemCard key={item.id}>
                <AuthorInfo>
                  <span>Post by <strong>{item.user.name}</strong></span>
                  <CollegeTag>{item.college}</CollegeTag>
                </AuthorInfo>
                
                <AdvertiseDescription>
                  "{item.description}"
                </AdvertiseDescription>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProductCard 
                    id={item.product.id}
                    name={item.product.name}
                    price={item.product.price}
                    status={item.product.status}
                    condition={item.product.condition}
                    images={item.product.image_url ? [item.product.image_url] : []}
                    created_at={item.product.created_at}
                  />
                </div>
              </CommunityItemCard>
            ))
          )}
        </CommunityGrid>
      )}
    </PageContainer>
  );
}
