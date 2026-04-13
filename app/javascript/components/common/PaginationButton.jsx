import styled from "styled-components";
import React from "react";
import { useSearchParams } from "react-router-dom";

const PaginButton = ({ currentPage, totalPages }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handlePageChange = (newPage) => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", newPage.toString());
      setSearchParams(newParams);
    };

    if (totalPages <= 1) return null;
    
    return (
        totalPages > 1 && (
            <PaginationContainer>
            <PaginationButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                Previous
            </PaginationButton>
            
            <PageInfo>Page {currentPage} of {totalPages}</PageInfo>
            
            <PaginationButton
                $isPrimary
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => handlePageChange(currentPage + 1)}
            >
                Next
            </PaginationButton>
            </PaginationContainer>
        )
    );
};

export default PaginButton;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
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
  border: none;

  ${props => props.$isPrimary 
    ? `
      background-color: ${props.disabled ? "#b896bd" : "#702082"};
      color: ${props.disabled ? "#eee0f0" : "#fff"};
    `
    : `
      background-color: ${props.disabled ? "#ccc" : "#e6e6e6"};
      color: ${props.disabled ? "#999" : "#333"};
    `
  }

  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: ${props.$isPrimary ? "#8e2da5" : "#d1d5db"};
    `}
  }

  &:active {
    ${props => !props.disabled && `
      transform: translateY(0);
      background-color: ${props.$isPrimary ? "#5a1a69" : "#9ca3af"};
    `}
`;