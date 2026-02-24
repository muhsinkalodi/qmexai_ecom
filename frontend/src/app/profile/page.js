'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './profile.module.css';

export default function Profile() {
    const { user, token, apiUrl, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'details'

    // Profile Edit State
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null, success: false });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    useEffect(() => {
        // Redirect if not logged in
        if (user === null && !token) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${apiUrl}/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, token, apiUrl, router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, error: null, success: false });

        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                // To reflect the change globally, we'd ideally trigger fetchUser in context
                // but for now, we show a local success banner. Next page load will sync.
                setUpdateStatus({ loading: false, error: null, success: true });
                setTimeout(() => setUpdateStatus(prev => ({ ...prev, success: false })), 3000);
            } else {
                const errorData = await res.json();
                setUpdateStatus({ loading: false, error: errorData.detail || 'Update failed', success: false });
            }
        } catch (error) {
            setUpdateStatus({ loading: false, error: 'Network error', success: false });
        }
    };

    if (!user) return null;

    return (
        <div className={`container ${styles.profileContainer}`}>
            <div className={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <h1>Hello, {user.name || user.email.split('@')[0]}</h1>
                    <p className={styles.email}>{user.email}</p>
                </div>
                <button onClick={logout} className={`btn-secondary ${styles.logoutBtn}`}>Sign Out</button>
            </div>

            <div className={styles.tabContainer} style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(102, 252, 241, 0.2)', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('orders')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? '#66FCF1' : '#C5C6C7', fontSize: '1.2rem', cursor: 'pointer', fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}
                >
                    Order History
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'details' ? '#66FCF1' : '#C5C6C7', fontSize: '1.2rem', cursor: 'pointer', fontWeight: activeTab === 'details' ? 'bold' : 'normal' }}
                >
                    Account Details
                </button>
            </div>

            {activeTab === 'orders' ? (
                <div className={styles.ordersSection}>

                    {loading ? (
                        <div className={styles.loader}>Loading your orders...</div>
                    ) : orders.length === 0 ? (
                        <div className={`glass-panel ${styles.emptyState}`}>
                            <p>You haven't placed any orders yet.</p>
                            <button onClick={() => router.push('/')} className="btn-primary mt-4">Start Shopping</button>
                        </div>
                    ) : (
                        <div className={styles.orderList}>
                            {orders.map(order => (
                                <div key={order.id} className={`glass-panel ${styles.orderCard}`}>
                                    <div className={styles.orderHeader}>
                                        <div>
                                            <span className={styles.orderId}>Order #{order.id}</span>
                                            <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className={styles.orderItems}>
                                        {order.items.map(item => (
                                            <div key={item.id} className={styles.itemRow}>
                                                <span className={styles.itemName}>{item.product.name} x {item.quantity}</span>
                                                <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Tracking Timeline */}
                                    <div className="w-full mt-6 mb-4 px-2">
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute left-0 top-1/2 -mt-[1px] w-full h-[2px] bg-gray-200 z-0"></div>

                                            {/* Step 1: Placed */}
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['Pending', 'Processing', 'Packed', 'Shipped'].includes(order.status) ? 'bg-[#A89ACD] text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
                                                <span className="text-[10px] uppercase font-semibold text-gray-500">Placed</span>
                                            </div>

                                            {/* Step 2: Processing */}
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['Processing', 'Packed', 'Shipped'].includes(order.status) ? 'bg-[#A89ACD] text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
                                                <span className="text-[10px] uppercase font-semibold text-gray-500">Processing</span>
                                            </div>

                                            {/* Step 3: Packed */}
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${['Packed', 'Shipped'].includes(order.status) ? 'bg-[#A89ACD] text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
                                                <span className="text-[10px] uppercase font-semibold text-gray-500">Packed</span>
                                            </div>

                                            {/* Step 4: Shipped */}
                                            <div className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${order.status === 'Shipped' ? 'bg-[#A89ACD] text-white' : 'bg-gray-200 text-gray-400'}`}>4</div>
                                                <span className="text-[10px] uppercase font-semibold text-gray-500">Shipped</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.orderFooter}>
                                        <span>Total Amount</span>
                                        <span className={styles.totalPrice}>${order.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className={`glass-panel`} style={{ padding: '30px', maxWidth: '600px' }}>
                    <h2 style={{ marginBottom: '20px', color: '#66FCF1' }}>Edit Account</h2>

                    {updateStatus.success && <div style={{ backgroundColor: 'rgba(69, 162, 158, 0.1)', color: '#45A29E', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(69, 162, 158, 0.2)' }}>Profile updated successfully!</div>}
                    {updateStatus.error && <div style={{ backgroundColor: 'rgba(255, 99, 71, 0.1)', color: '#ff6347', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(255, 99, 71, 0.2)' }}>{updateStatus.error}</div>}

                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#C5C6C7', fontSize: '0.9rem' }}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(102, 252, 241, 0.3)', backgroundColor: 'transparent', color: '#FFF' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#C5C6C7', fontSize: '0.9rem' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(102, 252, 241, 0.3)', backgroundColor: 'transparent', color: '#FFF' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#C5C6C7', fontSize: '0.9rem' }}>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(102, 252, 241, 0.3)', backgroundColor: 'transparent', color: '#FFF' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={updateStatus.loading} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                            {updateStatus.loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
