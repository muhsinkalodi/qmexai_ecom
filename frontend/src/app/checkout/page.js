'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './checkout.module.css';

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, token, apiUrl, isLoading } = useAuth();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Dummy form states
    const [address, setAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');

    const shippingFee = cartTotal > 999 ? 0 : 50;
    const finalTotal = cartTotal + shippingFee;

    // Requires login to check out
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className={`container ${styles.checkoutContainer}`}><h2>Loading checkout...</h2></div>;
    }

    if (!user) {
        return null;
    }

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setIsProcessing(true);
        setError(null);

        const itemsPayload = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));

        try {
            const res = await fetch(`${apiUrl}/orders/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: itemsPayload,
                    shipping_address: address
                })
            });

            if (res.ok) {
                clearCart();
                router.push('/profile');
                return;
            }

            const data = await res.json().catch(() => ({}));
            setError(data.detail || 'Checkout failed');

        } catch (err) {
            console.error("Checkout fetch error:", err);
            setError('Network error: Unable to reach the server.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className={`container ${styles.checkoutContainer}`}>
                <h2>Your cart is empty</h2>
                <button onClick={() => router.push('/')} className="btn-primary mt-4">Go Back</button>
            </div>
        );
    }

    return (
        <div className={`container ${styles.checkoutContainer}`}>
            <div className={styles.summarySection}>
                <h2>Order Summary</h2>
                <div className={`glass-panel ${styles.summaryBox}`}>
                    {cartItems.map((item) => (
                        <div key={item.product_id} className={styles.summaryItem}>
                            <span>{item.quantity} x {item.product.name}</span>
                            <span>${((item.product.discount_price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className={styles.summaryItem}>
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span>Shipping</span>
                        <span>{shippingFee === 0 ? 'Free (Orders > ₹999)' : `₹${shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span className={styles.totalVal}>₹{finalTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.paymentSection}>
                <h2>Shipping & Payment</h2>
                <form className={`glass-panel ${styles.paymentForm}`} onSubmit={handleCheckout}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label>Shipping Address</label>
                        <textarea
                            required
                            rows="3"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className={styles.inputField}
                            placeholder="123 Fashion Ave, NY 10001"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Credit Card (Dummy)</label>
                        <input
                            required
                            type="text"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className={styles.inputField}
                            placeholder="0000 0000 0000 0000"
                        />
                    </div>

                    <button type="submit" className={`btn-primary ${styles.payBtn}`} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : `Pay ₹${finalTotal.toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}
