import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { goodsTypes } from "../../common/productConstants";
import { colleges } from "../../common/collegeConstants";


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
    const query = params.toString();
    return `/search${query ? `?${query}` : ""}`;
  };

  const panelStyle = {
    position: "absolute",
    top: "100%",
    left: "0",
    backgroundColor: "white",
    border: "1px solid #ddd",
    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
    borderRadius: "8px",
    display: "flex",
    gap: "2rem",
    padding: "1.5rem",
    zIndex: 1000,
  };

  const columnStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "180px",
  };

  const titleStyle = {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#888",
    marginBottom: "0.5rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px",
  };

  const linkButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    padding: "4px 0",
    color: "#333",
    fontSize: "0.95rem",
  };

  const activeItemStyle = {
    fontWeight: "bold",
    color: "#e60000",
  };

  const hallStyle = {
    ...linkButtonStyle,
    paddingLeft: "18px",
    fontSize: "0.9rem",
    color: "#555",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "25px",
        padding: "8px 10px",
        backgroundColor: "white",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setIsCollegeOpen(true)}
        onMouseLeave={() => setIsCollegeOpen(false)}
      >
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #ddd",
            backgroundColor: isCollegeOpen ? "#f5f5f5" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {selectedCollege
            ? selectedHall
              ? `${selectedCollege} (${selectedHall})`
              : selectedCollege
            : "College"}{" "}
          <span>{isCollegeOpen ? "▴" : "▾"}</span>
        </button>

        {isCollegeOpen && (
          <div
            style={{
              ...panelStyle,
              minWidth: selectedCollege ? "420px" : "260px",
              display: "flex",
              flexDirection: "row",
              position: "absolute",
              top: "100%",
              left: 0,
              gap: "2rem",
              padding: "1.5rem",
            }}
          >
            <div style={{ ...columnStyle, minWidth: "160px" }}>
              <div style={titleStyle}>COLLEGE</div>
              {colleges.map(function (college) {
                return (
                  <button
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
                    style={{
                      ...linkButtonStyle,
                      ...(selectedCollege === college.name
                        ? activeItemStyle
                        : {}),
                    }}
                  >
                    {college.name}
                  </button>
                );
              })}
            </div>

            {selectedCollege && (
              <div style={{ ...columnStyle, minWidth: "160px" }}>
                <div style={titleStyle}>
                  HALLS IN {selectedCollege} (optional)
                </div>
                {colleges
                  .find(function (college) {
                    return college.name === selectedCollege;
                  })
                  .halls.map(function (hall) {
                    return (
                      <button
                        key={hall}
                        onClick={function () {
                          if (selectedHall === hall) {
                            setSelectedHall(null);
                          } else {
                            setSelectedHall(hall);
                          }
                        }}
                        style={{
                          ...linkButtonStyle,
                          ...(selectedHall === hall ? activeItemStyle : {}),
                        }}
                      >
                        {hall}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setIsTypeOpen(true)}
        onMouseLeave={() => setIsTypeOpen(false)}
      >
        <button
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            border: "1px solid #ddd",
            backgroundColor: isTypeOpen ? "#f5f5f5" : "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          {selectedType || "Goods Type"} <span>{isTypeOpen ? "▴" : "▾"}</span>
        </button>

        {isTypeOpen && (
          <div
            style={{
              ...panelStyle,
              minWidth: "220px",
              display: "block",
              position: "absolute",
              top: "100%",
              left: 0,
              gap: 0,
            }}
          >
            <div style={{ ...columnStyle, minWidth: "200px" }}>
              <div style={titleStyle}>GOODS TYPE</div>
              {goodsTypes.map(function (type) {
                return (
                  <button
                    key={type}
                    onClick={function () {
                      if (selectedType === type) {
                        setSelectedType(null);
                      } else {
                        setSelectedType(type);
                      }
                    }}
                    style={{
                      ...linkButtonStyle,
                      ...(selectedType === type ? activeItemStyle : {}),
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{ position: "relative", flex: 1 }}>
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          onKeyDown={function(e) {
            if (e.key === 'Enter') {
              navigate(getSearchUrl());
            }
          }}
          style={{
            width: "100%",
            padding: "10px 120px 10px 16px",
            borderRadius: "20px",
            border: "none",
            outline: "none",
            fontSize: "0.95rem",
            backgroundColor: "transparent",
          }}
        />
        <button
          onClick={() => navigate(getSearchUrl())}
          style={{
            position: "absolute",
            right: "4px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: "#2563eb",
            color: "white",
            textDecoration: "none",
            fontSize: "0.9rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            border: "none",
          }}
        >
          <FaSearch /> Search
        </button>
      </div>
    </div>
  );
}
