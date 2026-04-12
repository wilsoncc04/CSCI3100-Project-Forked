import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  color: #702082;
  border-bottom: 2px solid #702082;
  padding-bottom: 15px;
  margin-bottom: 30px;
  font-weight: 600;
`;

const ListGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const ItemCard = styled.div`
  display: flex;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: #702082;
  }
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
`;

const InfoSection = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ProductName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const Price = styled.p`
  color: #dc3545;
  font-weight: bold;
  margin: 0;
  font-size: 1rem;
`;

const StatusText = styled.span`
  font-size: 0.85rem;
  color: #888;
  text-transform: capitalize;
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

const EmptyState = styled.p`
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-style: italic;
`;

export default function Interested() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        // Fetch the list of products that the current user is interested in
        const response = await axios.get("/users/interests");
        setInterests(response.data);
      } catch (err) {
        console.error("Fetch interests failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterests();
  }, []);

  if (loading) return <LoadingMessage>Loading your list...</LoadingMessage>;

  return (
    <Container>
      <Title>Goods I'm Interested In</Title>
      
      {interests.length === 0 ? (
        <EmptyState>You haven't marked any items as interested yet.</EmptyState>
      ) : (
        <ListGrid>
          {interests.map((item) => (
            <ItemCard 
              key={item.id} 
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <ProductImage 
                src={item.images[0] || "https://via.placeholder.com/120"} 
                alt={item.name} 
              />
              <InfoSection>
                <ProductName>{item.name}</ProductName>
                <Price>${item.price} HKD</Price>
                <StatusText>
                  Status: {item.status}
                </StatusText>
              </InfoSection>
            </ItemCard>
          ))}
        </ListGrid>
      )}
    </Container>
  );
}