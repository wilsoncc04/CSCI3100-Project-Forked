import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

export default function FiltersAndSearch() {
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchKeywords, setSearchKeywords] = useState("");

  const colleges = [
    {
      name: "Chung Chi College",
      halls: [
        "Hua Lien Tang",
        "Lee Shu Pui Hall",
        "Madam S.H. Ho Hall",
        "Ming Hua Tang",
        "Pentecostal Mission Hall Complex (High Block)",
        "Pentecostal Mission Hall Complex (Low Block)",
        "Theology Building",
        "Wen Chih Tang",
        "Wen Lin Tang",
        "Ying Lin Tang",
      ],
    },
    {
      name: "New Asia College",
      halls: [
        "Chih Hsing Hall",
        "Xuesi Hall",
        "Grace Tien Hall",
        "Daisy Li Hall",
        "Mei Yun Tang",
      ],
    },
    {
      name: "United College",
      halls: [
        "Adam Schall Residence",
        "Bethlehem Hall",
        "Hang Seng Hall",
        "Chan Chun Ha Hostel",
        "Choi Kai Yau Residence",
      ],
    },
    { name: "Shaw College", halls: ["Kuo Mou Hall", "Student Hostel II"] },
    {
      name: "Morningside",
      halls: ["High Block", "Low Block"],
    },
    { name: "S.H. Ho", halls: ["Ho Tim Hall", "Lee Quo Wei Hall"] },
    { name: "C.W. Chu", halls: ["C.W. Chu Hall"] },
    { name: "Wu Yee Sun", halls: ["East Block", "West Block"] },
    {
      name: "Lee Woo Sing",
      halls: ["Dorothy and Ti-Hua KOO Building", "North Block"],
    },
  ];

  const goodsTypes = [
    "Textbooks & Notes",
    "Electronics & Gadgets",
    "Furniture & Home",
    "Clothing & Accessories",
    "Stationery & Supplies",
    "Snacks & Food",
    "Others",
  ];

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
          onClick={() => (window.location.href = getSearchUrl())}
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
