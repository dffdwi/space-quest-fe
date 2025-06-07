"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PlayerTask } from "@/hooks/useGameData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsChartProps {
  tasks: PlayerTask[];
}

const StatsChart: React.FC<StatsChartProps> = ({ tasks }) => {
  const processChartData = () => {
    const labels: string[] = [];
    const dataPoints: number[] = Array(7).fill(0);
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
    }

    tasks.forEach((task) => {
      if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const diffTime = today.getTime() - completedDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays < 7) {
          const index = 6 - diffDays;
          dataPoints[index]++;
        }
      }
    });

    return { labels, dataPoints };
  };

  const { labels, dataPoints } = processChartData();

  const data = {
    labels,
    datasets: [
      {
        label: "Objectives Cleared",
        data: dataPoints,
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: "rgba(99, 102, 241, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, 
      },
      title: {
        display: true,
        text: "Weekly Performance Scan",
        color: "#9ca3af",
        font: {
          size: 14,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#e5e7eb",
        bodyColor: "#d1d5db",
        borderColor: "#4b5563",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, 
          color: "#6b7280",
        },
        grid: {
          color: "rgba(75, 85, 99, 0.5)",
        },
      },
      x: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar options={options} data={data} />;
};

export default StatsChart;
