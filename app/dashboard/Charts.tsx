'use client';

import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface DashboardData {
  mostBorrowed: { title: string; count: number }[];
  borrowTrend: { month: string; count: number }[];
}

export default function Charts({ data }: { data: DashboardData }) {
  const barData = {
    labels: data.mostBorrowed.map((b) => b.title),
    datasets: [
      {
        label: 'Borrow Count',
        data: data.mostBorrowed.map((b) => b.count),
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
      }
    ]
  };

  const lineData = {
    labels: data.borrowTrend.map((b) => b.month),
    datasets: [
      {
        label: 'Borrowings',
        data: data.borrowTrend.map((b) => b.count),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)'
      }
    ]
  };

  return (
    <div>
      <div style={{ height: 300 }}>
        <Bar data={barData} />
      </div>
      <div style={{ height: 300 }}>
        <Line data={lineData} />
      </div>
    </div>
  );
}
