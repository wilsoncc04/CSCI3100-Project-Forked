import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

const SortDropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SortToggleButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.$isOpen ? "#f5f5f5" : "white")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
  transition: all 0.2s ease;
  &:hover { border-color: #bbb; }
`;

const SortDropdownPanel = styled.div`
  position: absolute;
  top: 100%;
  right: 0;           
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
`;

const SortOptionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  padding: 10px 16px;
  font-size: 0.95rem;
  color: ${(props) => (props.$isActive ? "#9e0ebb" : "#333")};
  font-weight: ${(props) => (props.$isActive ? "bold" : "normal")};
  transition: all 0.2s ease;
  &:hover { background-color: #f5f5f5; } 
`;

export default function SortDropdown() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentSort = searchParams.get("sort_by") || "default";

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    if (newSort === "default") {
      newParams.delete("sort_by");
    } else {
      newParams.set("sort_by", newSort);
    }
    newParams.set("page", "1");
    setSearchParams(newParams, { preventScrollReset: true });
    // setIsOpen(false);
  };

  const labels = {
    default: "Default Sorting",
    price_asc: "Price: Low to High",
    price_desc: "Price: High to Low",
    date_asc: "Date: Old to New",
    date_desc: "Date: New to Old",
  };

  return (
    <SortDropdownWrapper onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <SortToggleButton $isOpen={isOpen}>
        {labels[currentSort]} <span>{isOpen ? "▴" : "▾"}</span>
      </SortToggleButton>
      {isOpen && (
        <SortDropdownPanel>
          {Object.keys(labels).map((key) => (
            <SortOptionButton
              key={key}
              $isActive={currentSort === key}
              onClick={() => handleSortChange(key)}
            >
              {labels[key]}
            </SortOptionButton>
          ))}
        </SortDropdownPanel>
      )}
    </SortDropdownWrapper>
  );
}