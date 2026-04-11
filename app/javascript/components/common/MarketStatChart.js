import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { goodsTypes } from "../../common/productConstants";
import styled from "styled-components";

const PageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  align-items: center;
`;

const ChartSection = styled.div`
  flex: 1;
  min-width: 300px;
  height: 400px;
`;

const ChartTitle = styled.h4`
  margin: 0 0 12px 0;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
`;

const VerticalDivider = styled.div`
  width: 1px;
  background-color: #ddd;
  align-self: stretch;
  display: ${props => (props.$isMobile ? "none" : "block")};
`;

const DoughnutContainer = styled(ChartSection)`
  padding: 10px;
  background-color: #fff;
  border-radius: 8px;
`;

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

export default function MarketStatChart({ products }) {
    if (!products || products.length === 0) {
        return <p style={{ padding: "20px", color: "#888" }}>Gathering market data...</p>;
    }
    const isMobile = window.innerWidth < 768;
    const { chartData } = useMemo(() => {
    const counts = new Array(goodsTypes.length).fill(0);
    const activeProducts = products.filter(p => 
      p.status?.toLowerCase() === "available" || p.status?.toLowerCase() === "reserved"
    );

    activeProducts.forEach((p) => {
      const idx = p.category_id ? p.category_id - 1 : goodsTypes.length - 1; 
      if (idx >= 0 && idx < counts.length) counts[idx]++;
    });

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b", "#cbd5e1"];

    return {
      chartData: {
        labels: goodsTypes,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderColor: "#ffffff",
          borderWidth: 2,
          radius: '70%',
        }]
      }
    };
  }, [products]);

  const bentCalloutPlugin = {
    id: 'bentCallout',
    afterDraw: (chart) => {
      const { ctx, data } = chart;
      const dataset = data.datasets[0];
      if (!dataset || !dataset.data) return;

      const total = dataset.data.reduce((a, b) => a + b, 0);
      if (total === 0) return;

      const meta = chart.getDatasetMeta(0);
      
      meta.data.forEach((element, index) => {
        const value = dataset.data[index];
        if (!value || value === 0) return;

        const percentage = Math.round((value / total) * 100) + "%";

        if (element.x === undefined || element.outerRadius === undefined) return;

        const { x, y, outerRadius, startAngle, endAngle } = element;
        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const cos = Math.cos(midAngle);
        const sin = Math.sin(midAngle);

        const startX = x + cos * outerRadius;
        const startY = y + sin * outerRadius;
        const elbowX = x + cos * (outerRadius + 10);
        const elbowY = y + sin * (outerRadius + 10);
        const isRightSide = cos >= 0;
        const endX = elbowX + (isRightSide ? 10 : -10);
        const endY = elbowY;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = 'bold 14px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = isRightSide ? 'left' : 'right';
        ctx.fillText(percentage, endX + (isRightSide ? 5 : -5), endY);
        ctx.restore();
      });
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: { enabled: false },
      datalabels: { display: false } 
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 30 } }, 
    plugins: {
      legend: { display: false }, 
      datalabels: { display: false }
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } }
    }
  };

  return (
    <PageContainer>
      <ChartSection>
        <ChartTitle>Item Quantity</ChartTitle>
        <Bar data={chartData} options={barOptions} />
      </ChartSection>

      <VerticalDivider $isMobile={isMobile} />

      <DoughnutContainer>
        <ChartTitle style={{ margin: '0 0 -15px 0' }}>Category Share</ChartTitle>
        <Doughnut data={chartData} options={doughnutOptions} plugins={[bentCalloutPlugin]} />
      </DoughnutContainer>
    </PageContainer>
  );
}