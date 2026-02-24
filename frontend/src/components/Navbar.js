'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { cartItems, toggleCart } = useCart();
    const { user, logout } = useAuth();

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    Qmexai
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/category/new-arrivals" className={styles.link}>New Arrivals</Link>
                    <Link href="/category/men" className={styles.link}>Men</Link>
                    <Link href="/category/women" className={styles.link}>Women</Link>
                    <Link href="/category/kids" className={styles.link}>Kids</Link>
                    <div className={styles.separator}></div>
                    <Link href="/products" className={styles.link}>All Shop</Link>

                    {user ? (
                        <>
                            {user.is_admin ? (
                                <Link href="/admin" className={styles.link}>Admin Panel</Link>
                            ) : (
                                <Link href="/profile" className={styles.link}>Profile</Link>
                            )}
                            <button onClick={logout} className={styles.link}>Logout</button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.link}>Login</Link>
                    )}

                    <button className={styles.cartButton} onClick={toggleCart}>
                        Cart
                        {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[rgba(0,0,0,0.05)] shadow-[0_-5px_15px_rgba(0,0,0,0.03)] flex justify-around items-center p-3 md:hidden z-50`}>
                <Link href="/" className="flex flex-col items-center text-[#5F6368] hover:text-[#1A1A1A] transition-colors">
                    <span className="text-xl">🏠</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/products" className="flex flex-col items-center text-[#5F6368] hover:text-[#1A1A1A] transition-colors">
                    <span className="text-xl">🛍️</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Shop</span>
                </Link>
                <button onClick={toggleCart} className="flex flex-col items-center text-[#5F6368] hover:text-[#1A1A1A] transition-colors relative">
                    <span className="text-xl">🛒</span>
                    {totalItems > 0 && <span className="absolute -top-1 -right-2 bg-[#D32F2F] text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 font-bold">{totalItems}</span>}
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Cart</span>
                </button>
                <Link href={user ? (user.is_admin ? "/admin" : "/profile") : "/login"} className="flex flex-col items-center text-[#5F6368] hover:text-[#1A1A1A] transition-colors">
                    <span className="text-xl">👤</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">{user ? "Profile" : "Login"}</span>
                </Link>
            </div>
        </nav>
    );
}
