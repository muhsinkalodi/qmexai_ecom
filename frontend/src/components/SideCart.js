'use client';
import { useCart } from '../context/CartContext';
import styles from './SideCart.module.css';

export default function SideCart() {
    const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

    return (
        <>
            <div
                className={`${styles.overlay} ${isCartOpen ? styles.open : ''}`}
                onClick={closeCart}
            />
            <div className={`${styles.drawer} ${isCartOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h2>Your Cart</h2>
                    <button className={styles.closeBtn} onClick={closeCart}>&times;</button>
                </div>

                <div className={styles.itemsList}>
                    {cartItems.length === 0 ? (
                        <p className={styles.emptyMsg}>Your cart is empty.</p>
                    ) : (
                        cartItems.map(item => (
                            <div key={item.product_id} className={styles.cartItem}>
                                <div className={styles.itemImage} style={{ backgroundImage: `url(${item.product.photos && item.product.photos.length > 0 ? item.product.photos[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'})` }}></div>
                                <div className={styles.itemDetails}>
                                    <h4>{item.product.name}</h4>
                                    <p className={styles.price}>${(item.product.discount_price || 0).toFixed(2)}</p>
                                    <div className={styles.qtyControl}>
                                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                                <button className={styles.removeBtn} onClick={() => removeFromCart(item.product_id)}>Remove</button>
                            </div>
                        ))
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.total}>
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className={`btn-primary ${styles.checkoutBtn}`} onClick={() => { closeCart(); window.location.href = '/checkout'; }}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
