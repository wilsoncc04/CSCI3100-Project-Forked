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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

export default function MarketStatChart({ products }) {
    if (!products || products.length === 0) {
        return <p style={{ padding: "20px", color: "#888" }}>Gathering market data...</p>;
    }
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: "300px", height: "400px" }}>
        <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: '#333' }}>
          Item Quantity
        </h4>
        <Bar data={chartData} options={barOptions} />
      </div>

      <div style={{ 
        width: "1px", 
        backgroundColor: "#ddd", 
        alignSelf: "stretch", 
        display: window.innerWidth < 768 ? "none" : "block" 
      }}></div>

      <div style={{ 
        flex: 1, 
        minWidth: "300px", 
        height: "400px", 
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "8px"
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '-5px', color: '#555' }}>
          Category Share
        </h4>
        <Doughnut data={chartData} options={doughnutOptions} plugins={[bentCalloutPlugin]} />
      </div>
      
    </div>
  );
}