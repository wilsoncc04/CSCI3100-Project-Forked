import React from "react";

export default function MarketplaceFilters() {
  return (
    <div className="marketplace-filters">
      <select name="College" id="college-select">
        <option value="Chung Chi">Chung Chi</option>
        <option value="New Asia">New Asia</option>
        <option value="United">United</option>
        <option value="Shaw">Shaw</option>
        <option value="Morningside">Morningside</option>
        <option value="S.H. Ho">S.H. Ho</option>
        <option value="C.W. Chu">C.W. Chu</option>
        <option value="Wu Yee Sun">Wu Yee Sun</option>
        <option value="Lee Woo Sing">Lee Woo Sing</option>
      </select>

      <select name="Goods Type" id="goods-type-select">
        <option value="Textbooks">Textbooks</option>
        <option value="Furniture">Furniture</option>
        <option value="Stationery">Stationery</option>
        <option value="Snacks">Snacks</option>
      </select>
    </div>
  );
}