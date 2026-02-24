'use client';

import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import styles from './adminDashboard.module.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AdminDashboard() {
    const { apiUrl, token } = useAuth();
    const [stats, setStats] = useState({ total_sales: 0, order_count: 0, status_counts: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${apiUrl}/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch revenue stats");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchStats();
    }, [apiUrl, token]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#C5C6C7'
                }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#C5C6C7' }
            },
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#C5C6C7' }
            }
        }
    };

    // Mock data for trends
    const lineData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Revenue Trend ($)',
                data: [120, 190, 80, 250, 400, 310, stats.total_sales || 500],
                borderColor: '#66FCF1',
                backgroundColor: 'rgba(102, 252, 241, 0.2)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const statusLabels = Object.keys(stats.status_counts || {});
    const statusData = Object.values(stats.status_counts || {});

    const doughnutData = {
        labels: statusLabels.length ? statusLabels : ['Pending'],
        datasets: [
            {
                label: 'Order Statuses',
                data: statusData.length ? statusData : [1],
                backgroundColor: ['#66FCF1', '#45A29E', '#A89ACD', '#1A1A1A', '#F8F7F4'],
                borderWidth: 0,
            }
        ]
    };

    if (loading) return <div className={styles.loading}>Loading Dashboard...</div>;

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Revenue Analytics Dashboard</h1>
                <p className={styles.subtitle}>Overview of store performance</p>
            </header>

            <div className={styles.statsGrid}>
                <div className={`glass-panel ${styles.statCard}`}>
                    <h3>Total Revenue</h3>
                    <p className={styles.statValue}>${stats.total_sales.toFixed(2)}</p>
                </div>
                <div className={`glass-panel ${styles.statCard}`}>
                    <h3>Total Orders</h3>
                    <p className={styles.statValue}>{stats.order_count}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={`glass-panel ${styles.chartBox}`}>
                    <h3>Order Trends</h3>
                    <div className={styles.chartWrapper}>
                        <Line options={chartOptions} data={lineData} />
                    </div>
                </div>
                <div className={`glass-panel ${styles.chartBox}`}>
                    <h3>Order Status Distribution</h3>
                    <div className={styles.chartWrapper}>
                        <Doughnut options={{ ...chartOptions, maintainAspectRatio: false }} data={doughnutData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
