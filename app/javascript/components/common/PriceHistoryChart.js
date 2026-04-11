import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios from "axios";
import styled from "styled-components";

const PageContainer = styled.div`
  width: 100%;
  height: 300px; 
  position: relative;
`;

const ChartTitle = styled.h4`
  margin: "0 0 10px 0";
  fontWeight: "bold";
  fontSize: "0.9rem"; 
  color: "#555";
`;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
;
export default function PriceHistoryChart({ productId }) {
  const [chartData, setChartData] = useState(null);
  const [chartTitle, setChartTitle] = useState("Price History");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/products/price_history?product_id=${productId}&points=7`);
        const historyData = res.data.history || [];
        const dataType = res.data.type;
        
        const labelName = dataType === 'category' 
          ? `${res.data.category_name} Average Price` 
          : "Actual Item Price";

        setChartTitle(dataType === 'category' ? "Category Price Trends (7 days)" : "Item Price History");

        const sortedData = historyData.reverse(); 

        const labels = sortedData.map((item) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        const prices = sortedData.map((item) => item.price);

        const avgPrice = prices.length > 0 
          ? prices.reduce((a, b) => a + b, 0) / prices.length 
          : 0;
        const avgLineData = Array(prices.length).fill(avgPrice);

        setChartData({
          labels,
          datasets: [
            {
              label: `${labelName} (HKD)`,
              data: prices,
              borderColor: dataType === 'category' ? "#36A2EB" : "#e60000", 
              backgroundColor: dataType === 'category' ? "#36A2EB" : "#e60000",
              tension: 0.3,
            },
            {
              label: "7-Day Average Level",
              data: avgLineData,
              borderColor: "#888",
              borderDash: [5, 5], 
              pointRadius: 0, 
              borderWidth: 2,
            },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch price history", err);
      }
    };

    if (productId) fetchHistory();
  }, [productId]);

  if (!chartData) return <p>Loading chart data...</p>;
  if (chartData.labels.length <= 1) return <p style={{color: "#888"}}>Not enough price history available yet.</p>;

  return (
    <PageContainer>
      <ChartTitle>{chartTitle}</ChartTitle>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: {datalabels: {display: false } } }} />
    </PageContainer>
  );
}