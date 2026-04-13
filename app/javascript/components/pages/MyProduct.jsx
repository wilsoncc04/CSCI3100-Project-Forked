import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { HiChevronRight } from "react-icons/hi";
import apiClient from "../../common/apiClient";
import { notify } from "../../common/notify";
import { getMySellingProducts } from "../../common/productUtils";
import SortDropdown from "../common/SortDropDown";

const PageContainer = styled.div`
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #702082;
  padding-bottom: 15px;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  color: #702082;
  margin: 0; 
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  table-layout: auto;
  `;
  
  const Th = styled.th`
  padding: 15px;
  border-bottom: 2px solid #eee;
  color: #333;
  text-align: left;
  background-color: #f8f9fa;
  &:first-child {
    border-top-left-radius: 9px;
  }
  &:last-child {
    border-top-right-radius: 9px;
  }
  &:not(:first-child) {
    white-space: nowrap;
  }
`;


const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  word-break: break-word;
  overflow: hidden;
  &:not(:first-child) {
    white-space: nowrap;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: default;
  gap: 8px;
  font-weight: bold;
  align-items: center;
  overflow-wrap: break-word; 
  word-wrap: break-word;
  white-space: normal;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  flex-shrink: 0;
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

const ViewButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 4px;
  cursor: pointer;
  
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-weight: bold;
  color: #555;
  
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    border-radius: 4px;
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(0);
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

  const [searchParams] = useSearchParams();
  const sortOption = searchParams.get("sort_by") || "default";

  useEffect(() => {
    fetchMyProducts();
  }, [sortOption]);

  // Fetch the list of products currently being sold by the user
  const fetchMyProducts = async () => {
    try {
      // setLoading(true);
      const data = await getMySellingProducts({ sort_by: sortOption });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching my products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion with confirmation
  const handleDelete = async (id) => {
    const confirmed = await notify.confirm("Delete Confirmation", "Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await apiClient.delete(`/products/${id}`);
      
      setProducts(products.filter(p => p.id !== id));
      notify.success("Product deleted successfully!");
    } catch (error) {
        console.error("Error deleting product:", error);
        notify.error("Error deleting product: " + (error.response?.data?.error || error.message));
        }
  };

  if (loading) return <LoadingText>Loading your items...</LoadingText>;

  return (
    <PageContainer>
      <Header>
        <Title>My Products</Title>
        <SortDropdown />
      </Header>
      
      <Table>
        <thead style={{ borderRadius: "12px" }}>
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
                    {product.images && product.images.length > 0 && (
                      <Thumbnail 
                      src={product.images[0]} 
                      alt="Product Thumbnail" 
                      />
                    )}
                    {product.name}
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
                    <ViewButton onClick={() => navigate(`/product/${product.id}`)}>
                      <HiChevronRight size={20} />
                    </ViewButton>
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