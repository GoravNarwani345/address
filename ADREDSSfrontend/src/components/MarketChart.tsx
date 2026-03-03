import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const MarketChart: React.FC<{ data: any }> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#0f172a',
                titleColor: '#2563eb',
                bodyColor: '#fff',
                borderColor: '#1e293b',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#64748b',
                    callback: (value: any) => `PKR ${(value / 1000000).toFixed(0)}M`,
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b',
                },
            },
        },
    } as any;

    const chartData = {
        labels: data?.trends?.map((t: any) => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                fill: true,
                label: 'Average Price',
                data: data?.trends?.map((t: any) => t.price) || [32000000, 34000000, 35000000, 33000000, 36000000, 38000000],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    return (
        <div className="h-full w-full">
            <Line options={options} data={chartData} />
        </div>
    );
};

export default MarketChart;
