import apiClient from "./apiClient";

export const getProducts = async (params) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
};

export const getMySellingProducts = async (params) => {
  const response = await apiClient.get("/products/selling", { params });
  return response.data;
};