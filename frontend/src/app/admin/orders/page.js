'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from './adminOrders.module.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

export default function AdminOrders() {
    const { apiUrl, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error("Failed to load all orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [apiUrl, token]);

    const handleViewOrder = async (orderId) => {
        // This will hit the endpoint which automatically updates status to "Processing"
        try {
            const res = await fetch(`${apiUrl}/admin/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                // Refresh the orders list to show the new status
                fetchOrders();
            }
        } catch (e) {
            console.error("Failed to view order");
        }
    };

    const generateInvoice = async (orderId) => {
        try {
            // Fetch the populated order details first
            const res = await fetch(`${apiUrl}/admin/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const order = await res.json();
                const doc = new jsPDF();

                // Header
                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.text("QMEXAI INVOICE", 14, 22);

                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.text(`Order ID: #${order.id}`, 14, 34);
                doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 14, 40);
                doc.text(`Order Status: ${order.status}`, 14, 46);

                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text(`Shipping Address:`, 14, 52);
                doc.setFont("helvetica", "normal");
                const splitAddress = doc.splitTextToSize(order.shipping_address || 'No Address Provided', 100);
                doc.text(splitAddress, 14, 58);

                // Generate Delivery Barcode Header
                try {
                    const canvas = document.createElement('canvas');
                    JsBarcode(canvas, `ORDER-${order.id}`, { format: "CODE128", displayValue: true, height: 40, width: 2, background: "transparent" });
                    const barcodeImg = canvas.toDataURL("image/jpeg");
                    doc.addImage(barcodeImg, 'JPEG', 130, 20, 60, 20);
                } catch (bErr) {
                    console.error("Barcode generated failed: ", bErr);
                }

                // Table
                const tableColumn = ["Item Description", "Quantity", "Unit Price", "Subtotal"];
                const tableRows = [];

                order.items.forEach(item => {
                    const itemData = [
                        item.product.name,
                        item.quantity,
                        `$${item.price.toFixed(2)}`,
                        `$${(item.price * item.quantity).toFixed(2)}`
                    ];
                    tableRows.push(itemData);
                });

                autoTable(doc, {
                    head: [tableColumn],
                    body: tableRows,
                    startY: 75,
                    theme: 'grid',
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [26, 26, 26] }
                });

                // Footer
                const finalY = doc.lastAutoTable.finalY || 55;
                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.text(`Total Amount: $${order.total_amount.toFixed(2)}`, 14, finalY + 15);

                doc.save(`Qmexai_Receipt_${order.id}.pdf`);
            } else {
                alert('Failed to retrieve order for invoicing');
            }
        } catch (e) {
            console.error("Failed to generate invoice", e);
        }
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Orders...</div>;

    return (
        <div className={styles.ordersContainer}>
            <header className={styles.header}>
                <h1>Order Management</h1>
                <p className={styles.subtitle}>View all customer orders and generate invoices.</p>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.ordersTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer ID</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.user_id}</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>${order.total_amount.toFixed(2)}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className={styles.actionCell}>
                                    {order.status === 'Pending' && (
                                        <button
                                            className={`btn-secondary ${styles.actionBtn}`}
                                            onClick={() => handleViewOrder(order.id)}
                                        >
                                            Process Order
                                        </button>
                                    )}
                                    <button
                                        className={`btn-primary ${styles.actionBtn}`}
                                        onClick={() => generateInvoice(order.id)}
                                    >
                                        Invoice PDF
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="6" className={styles.emptyState}>No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
