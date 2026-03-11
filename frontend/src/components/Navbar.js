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
        <header className={styles.header}>
            {/* Top Tier: Branding, Search & Actions */}
            <div className={`container ${styles.topTier}`}>
                <div className={styles.logoSection}>
                    <Link href="/" className={styles.logo}>
                        Qmexai
                    </Link>
                    <span className={styles.logoTagline}>Explore Plus</span>
                </div>

                {/* Flipkart Style Search Bar (Read-only UI for now) */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        className="w-full bg-[#f0f5ff] text-black px-4 py-2 rounded-sm focus:outline-none focus:bg-white focus:shadow-md transition-all duration-200"
                    />
                    <button className="absolute right-0 top-0 h-full px-4 text-[#2874f0]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {user ? (
                        <div className="group relative">
                            <button className={styles.actionBtn}>
                                {user.name ? user.name.split(' ')[0] : 'Profile'}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-sm border border-gray-100 hidden group-hover:flex flex-col z-50">
                                {user.is_admin && (
                                    <Link href="/admin" className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50 flex justify-between">Admin Panel <span className="text-gray-400">⚡</span></Link>
                                )}
                                <Link href="/profile" className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">My Profile</Link>
                                <Link href="/profile" className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">Orders</Link>
                                <button onClick={logout} className="px-4 py-3 text-sm text-left text-gray-700 hover:bg-gray-50 w-full">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="bg-white text-[#2874f0] font-semibold px-8 py-1.5 border border-gray-200 hover:shadow-md transition-shadow">Login</Link>
                    )}

                    <Link href="/products" className={styles.actionBtn}>All Shop</Link>

                    <button className={`${styles.actionBtn} flex items-center`} onClick={toggleCart}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                        </svg>
                        Cart
                        {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
                    </button>
                </div>
            </div>

            {/* Bottom Tier: Category Strip (Only Desktop) */}
            <div className={`hidden md:flex ${styles.bottomTier}`}>
                <div className="container flex items-center justify-between px-10">
                    <Link href="/category/new-arrivals" className={styles.catLink}>New Arrivals</Link>
                    <Link href="/category/men" className={styles.catLink}>Men's Fashion</Link>
                    <Link href="/category/women" className={styles.catLink}>Women's Fashion</Link>
                    <Link href="/category/kids" className={styles.catLink}>Kids & Toys</Link>
                    <Link href="/products" className={styles.catLink}>Electronics</Link>
                    <Link href="/products" className={styles.catLink}>Home & Furniture</Link>
                    <Link href="/products" className={styles.catLink}>Sports</Link>
                </div>
            </div>

            {/* Mobile Bottom Navigation Bar - Kept perfectly responsive */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center p-3 md:hidden z-50`}>
                <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-[#2874f0] transition-colors">
                    <span className="text-xl">🏠</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/products" className="flex flex-col items-center text-gray-500 hover:text-[#2874f0] transition-colors">
                    <span className="text-xl">🛍️</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Shop</span>
                </Link>
                <button onClick={toggleCart} className="flex flex-col items-center text-gray-500 hover:text-[#2874f0] transition-colors relative">
                    <span className="text-xl">🛒</span>
                    {totalItems > 0 && <span className="absolute -top-1 -right-2 bg-[#ff6161] text-white text-[10px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 font-bold shadow-sm">{totalItems}</span>}
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Cart</span>
                </button>
                <Link href={user ? (user.is_admin ? "/admin" : "/profile") : "/login"} className="flex flex-col items-center text-gray-500 hover:text-[#2874f0] transition-colors">
                    <span className="text-xl">👤</span>
                    <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">{user ? "Profile" : "Login"}</span>
                </Link>
            </div>
        </header>
    );
}
