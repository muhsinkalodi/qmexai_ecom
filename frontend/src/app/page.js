'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { apiUrl } = useAuth();
  const [recentProducts, setRecentProducts] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/`);
        if (res.ok) {
          const data = await res.json();

          // Filter logic for Flipkart rows
          setRecentProducts(data.filter(p => p.tags?.toLowerCase().includes('new arrival') || p.id > data.length - 10)); // Deals of the Day / New

          // Sort by rating or mock it if missing
          const rated = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopRated(rated.slice(0, 10)); // Top Rated row
        }
      } catch (error) {
        console.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl]);

  return (
    <div className={styles.homeContainer}>

      {/* Flipkart Mega Hero Banner */}
      <section className={styles.megaHero}>
        <div className={`container ${styles.megaContent}`}>
          <div className={styles.megaText}>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">The Big <br /> Billion Fashion Sale</h1>
            <p className="text-xl opacity-90 mb-8">Up to 80% Off on Top Brands</p>
            <Link href="/products" className="bg-white text-[#2874f0] font-bold px-8 py-3 rounded-sm shadow-md hover:scale-105 transition-transform">Explore Deals</Link>
          </div>
        </div>
      </section>

      <div className="container mt-4 flex flex-col gap-6 pb-20">

        {/* Flipkart Row 1: Deal of the Day */}
        <section className={styles.dealRow}>
          <div className={styles.rowHeader}>
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center">
                Deal of the Day
                <span className="ml-3 bg-[#2874f0] text-white text-xs px-2 py-1 rounded-sm shadow-sm animate-pulse">LIVE</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Discounts up to 60%</p>
            </div>
            <Link href="/category/new-arrivals" className="bg-[#2874f0] text-white text-sm font-semibold px-4 py-2 rounded-sm shadow-sm hover:shadow-md transition-shadow">VIEW ALL</Link>
          </div>

          <div className={styles.horizontalScroll}>
            {loading ? (
              <div className="flex gap-4"><SkeletonLoader type="card" count={5} /></div>
            ) : recentProducts.length > 0 ? (
              recentProducts.map(product => (
                <div key={product.id} className={styles.scrollItem}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="p-8 text-gray-500">No deals available right now.</p>
            )}
          </div>
        </section>

        {/* Flipkart Row 2: Top Rated Fashion */}
        <section className={styles.dealRow}>
          <div className={styles.rowHeader}>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Top Rated Fashion</h2>
              <p className="text-sm text-gray-500 mt-1">Highly recommended by users</p>
            </div>
            <Link href="/products" className="bg-[#2874f0] text-white text-sm font-semibold px-4 py-2 rounded-sm shadow-sm hover:shadow-md transition-shadow">VIEW ALL</Link>
          </div>

          <div className={styles.horizontalScroll}>
            {loading ? (
              <div className="flex gap-4"><SkeletonLoader type="card" count={5} /></div>
            ) : topRated.length > 0 ? (
              topRated.map(product => (
                <div key={product.id} className={styles.scrollItem}>
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="p-8 text-gray-500">No products available.</p>
            )}
          </div>
        </section>

        {/* Promotional Banners Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 flex flex-col justify-center rounded-sm border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">Axis Bank Offer</h3>
            <p className="text-sm text-gray-600 mb-4">Extra 5% Cashback on Credit Cards</p>
            <span className="text-[#2874f0] text-sm font-bold">Apply Now &gt;</span>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-8 flex flex-col justify-center rounded-sm border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">Qmexai Plus</h3>
            <p className="text-sm text-gray-600 mb-4">Get Free Delivery on all Orders</p>
            <span className="text-[#2874f0] text-sm font-bold">Explore Plus &gt;</span>
          </div>
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-8 flex flex-col justify-center rounded-sm border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">Exchange Offers</h3>
            <p className="text-sm text-gray-600 mb-4">Up to ₹500 off on exchange</p>
            <span className="text-[#2874f0] text-sm font-bold">View Rules &gt;</span>
          </div>
        </div>

      </div>
    </div>
  );
}
