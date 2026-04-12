import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const PageContainer = styled.div`
  padding: 40px;
  max-width: 1000px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  padding: 15px;
  border-bottom: 2px solid #eee;
  color: #333;
  text-align: left;
  background-color: #f8f9fa;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: bold;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'sold': return '#e9ecef';
      case 'reserved': return '#fff3cd';
      default: return '#d4edda';
    }
  }};
  color: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'sold': return '#6c757d';
      case 'reserved': return '#856404';
      default: return '#155724';
    }
  }};
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const EditButton = styled(ActionButton)`
  background-color: transparent;
  color: #702082;
  border: 1px solid #702082;
`;

const DeleteButton = styled(ActionButton)`
  background-color: #dc3545;
  color: #fff;
  border: none;
`;

const LoadingText = styled.div`
  padding: 40px;
  text-align: center;
  font-size: 1.1rem;
  color: #666;
`;

const EmptyMessage = styled.td`
  padding: 40px;
  text-align: center;
  color: #888;
  font-style: italic;
`;

export default function SellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProducts();
  }, []);

  // Fetch the list of products currently being sold by the user
  const fetchMyProducts = async () => {
    try {
      const response = await axios.get("/products/selling", {
        withCredentials: true
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion with confirmation and CSRF token security
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(`/products/${id}`, {
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        }
      });
      
      // Update the local state to remove the deleted product from UI
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete product.");
    }
  };

  if (loading) return <LoadingText>Loading your items...</LoadingText>;

  return (
    <PageContainer>
      <Title>On-Selling Products</Title>
      
      <Table>
        <thead>
          <tr>
            <Th>Item Name</Th>
            <Th>Price (HKD)</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <EmptyMessage colSpan="4">
                You haven't listed any products yet.
              </EmptyMessage>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <Td>
                  <ItemInfo>
                    {product.name}
                    {product.images && product.images.length > 0 && (
                      <Thumbnail 
                        src={product.images[0]} 
                        alt="Product Thumbnail" 
                      />
                    )}
                  </ItemInfo>
                </Td>

                <Td>${product.price}</Td>

                <Td>
                  <StatusBadge status={product.status}>
                    {product.status}
                  </StatusBadge>
                </Td>

                <Td>
                  <ActionGroup>
                    <EditButton onClick={() => navigate(`/edit/${product.id}`)}>
                      Edit
                    </EditButton>
                    
                    <DeleteButton onClick={() => handleDelete(product.id)}>
                      Delete
                    </DeleteButton>
                  </ActionGroup>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </PageContainer>
  );
}