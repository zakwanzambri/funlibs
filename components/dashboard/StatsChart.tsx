'use client';
import {Bar} from 'react-chartjs-2';
import {Chart, BarElement, CategoryScale, LinearScale} from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale);

export default function StatsChart({labels, data}:{labels:string[]; data:number[]}) {
  return <Bar data={{labels, datasets:[{label:'Borrows', data, backgroundColor:'#3b82f6'}]}} />;
}
