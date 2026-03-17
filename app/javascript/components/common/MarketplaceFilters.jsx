import React from "react";

export default function MarketplaceFilters() {
  return (
    <div className="marketplace-filters">
      <select name="College" id="college-select">
        <option value="Chung Chi">Chung Chi College</option>
        <option value="New Asia">New Asia College</option>
        <option value="United">United COllege</option>
        <option value="Shaw">Shaw College</option>
        <option value="Morningside">Morningside Collgeg</option>
        <option value="S.H. Ho">S.H. Ho College</option>
        <option value="C.W. Chu">C.W. Chu College</option>
        <option value="Wu Yee Sun">Wu Yee Sun College</option>
        <option value="Lee Woo Sing">Lee Woo Sing College</option>
      </select>

      <select name="Goods Type" id="goods-type-select">
        <option value="Textbooks">Textbooks & Notes</option>
        <option value="Electronics">Electronics & Gadgets</option>
        <option value="Furniture">Furniture & Home</option>
        <option value="Clothing">Clothing & Accessories</option>
        <option value="Stationery">Stationery & Supplies</option>
        <option value="Snacks">Snacks & Food</option>
        <option value="Others">Others</option>
      </select>
    </div>
  );
}