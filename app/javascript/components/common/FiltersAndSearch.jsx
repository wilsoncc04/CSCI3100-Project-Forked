import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { FaSearch, FaTimes, FaUndo } from "react-icons/fa";
import { goodsTypes } from "../../common/productConstants";
import { colleges } from "../../common/collegeConstants";
import { ResetButton } from "../../common/style";

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 25px;
  padding: 8px 10px;
  background-color: white;
  box-sizing: border-box;
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownToggleButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.$isOpen ? "#f5f5f5" : "white")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DropdownPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: ${(props) => (props.$isBlock ? "block" : "flex")};
  flex-direction: ${(props) => (props.$isBlock ? "column" : "row")};
  gap: ${(props) => (props.$isBlock ? "0" : "2rem")};
  padding: 1.5rem;
  z-index: 1000;
  min-width: ${(props) => props.$minWidth || "auto"};
`;

const DropdownColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: ${(props) => props.$minWidth || "180px"};
`;

const ColumnTitle = styled.div`
  font-size: 0.9rem;
  font-weight: bold;
  color: #888;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
`;

const OptionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  padding: ${(props) => (props.$isHall ? "6px 16px 6px 18px" : "8px 16px")};
  font-size: ${(props) => (props.$isHall ? "0.9rem" : "0.95rem")};
  color: ${(props) => {
    if (props.$isActive) return "#9e0ebb";
    if (props.$isHall) return "#555";
    return "#333";
  }};
  font-weight: ${(props) => (props.$isActive ? "bold" : "normal")};
  border-radius: 20px;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 140px 10px 16px;
  border-radius: 20px;
  border: none;
  outline: none;
  font-size: 0.95rem;
  background-color: transparent;
  box-sizing: border-box;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 110px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    color: #555;
    background-color: #f3e8f5;
  }
`;

const SubmitSearchButton = styled.button`
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #702082;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  border: none;
`;

export default function FiltersAndSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(searchParams.get("college") || null);
  const [selectedHall, setSelectedHall] = useState(searchParams.get("hall") || null);
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || null);
  const [searchKeywords, setSearchKeywords] = useState(searchParams.get("keywords") || "");

  useEffect(() => {
    setSelectedCollege(searchParams.get("college") || null);
    setSelectedHall(searchParams.get("hall") || null);
    setSelectedType(searchParams.get("type") || null);
    setSearchKeywords(searchParams.get("keywords") || "");
  }, [searchParams]);

  const getSearchUrl = () => {
    const params = new URLSearchParams();
    if (selectedCollege) params.set("college", selectedCollege);
    if (selectedHall) params.set("hall", selectedHall);
    if (selectedType) params.set("type", selectedType);
    if (searchKeywords.trim()) params.set("keywords", searchKeywords.trim());
    params.set("page", "1");
    const currentSort = searchParams.get("sort_by");
    if (currentSort) {
      params.set("sort_by", currentSort);
    }
    const query = params.toString();
    return `/search${query ? `?${query}` : ""}`;
  };

  const handleResetFilters = () => {
    setSelectedCollege(null);
    setSelectedHall(null);
    setSelectedType(null);
  };

  const handleClearKeywords = () => {
    setSearchKeywords("");
  };

  return (
    <SearchBarContainer>
      <DropdownWrapper
        onMouseEnter={() => setIsCollegeOpen(true)}
        onMouseLeave={() => setIsCollegeOpen(false)}
      >
        <DropdownToggleButton $isOpen={isCollegeOpen}>
          {selectedCollege
            ? selectedHall
              ? `${selectedCollege} (${selectedHall})`
              : selectedCollege
            : "College"}{" "}
          <span>{isCollegeOpen ? "▴" : "▾"}</span>
        </DropdownToggleButton>

        {isCollegeOpen && (
          <DropdownPanel $minWidth={selectedCollege ? "420px" : "260px"}>
            <DropdownColumn $minWidth="160px">
              <ColumnTitle>COLLEGE</ColumnTitle>
              {colleges.map(function (college) {
                return (
                  <OptionButton
                    key={college.name}
                    onClick={function () {
                      if (selectedCollege === college.name) {
                        setSelectedCollege(null);
                        setSelectedHall(null);
                      } else {
                        setSelectedCollege(college.name);
                        setSelectedHall(null);
                      }
                    }}
                    $isActive={selectedCollege === college.name}
                  >
                    {college.name}
                  </OptionButton>
                );
              })}
            </DropdownColumn>

            {selectedCollege && (
              <DropdownColumn $minWidth="160px">
                <ColumnTitle>
                  HALLS IN {selectedCollege} (optional)
                </ColumnTitle>
                {colleges
                  .find(function (college) {
                    return college.name === selectedCollege;
                  })
                  .halls.map(function (hall) {
                    return (
                      <OptionButton
                        key={hall}
                        onClick={function () {
                          if (selectedHall === hall) {
                            setSelectedHall(null);
                          } else {
                            setSelectedHall(hall);
                          }
                        }}
                        $isHall
                        $isActive={selectedHall === hall}
                      >
                        {hall}
                      </OptionButton>
                    );
                  })}
              </DropdownColumn>
            )}
          </DropdownPanel>
        )}
      </DropdownWrapper>

      <DropdownWrapper
        onMouseEnter={() => setIsTypeOpen(true)}
        onMouseLeave={() => setIsTypeOpen(false)}
      >
        <DropdownToggleButton $isOpen={isTypeOpen}>
          {selectedType || "Goods Type"} <span>{isTypeOpen ? "▴" : "▾"}</span>
        </DropdownToggleButton>

        {isTypeOpen && (
          <DropdownPanel $isBlock $minWidth="220px">
            <DropdownColumn $minWidth="200px">
              <ColumnTitle>GOODS TYPE</ColumnTitle>
              {goodsTypes.map(function (type) {
                return (
                  <OptionButton
                    key={type}
                    onClick={function () {
                      if (selectedType === type) {
                        setSelectedType(null);
                      } else {
                        setSelectedType(type);
                      }
                    }}
                    $isActive={selectedType === type}
                  >
                    {type}
                  </OptionButton>
                );
              })}
            </DropdownColumn>
          </DropdownPanel>
        )}
      </DropdownWrapper>

      {(selectedCollege || selectedType) && (
        <ResetButton onClick={handleResetFilters} title="Reset Filters">
          <FaUndo size={14} />
        </ResetButton>
      )}

      <SearchInputWrapper>
        <SearchInput
          type="text"
          placeholder="Search keywords..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          onKeyDown={function (e) {
            if (e.key === "Enter") {
              navigate(getSearchUrl());
            }
          }}
        />

        {searchKeywords && (
          <ClearButton onClick={handleClearKeywords} title="Clear Keywords">
            <FaTimes size={14} />
          </ClearButton>
        )}

        <SubmitSearchButton onClick={() => navigate(getSearchUrl())}>
          <FaSearch /> Search
        </SubmitSearchButton>
      </SearchInputWrapper>
    </SearchBarContainer>
  );
}