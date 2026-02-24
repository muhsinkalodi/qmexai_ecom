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
  const [featuredCarousel, setFeaturedCarousel] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${apiUrl}/products/`);
        if (res.ok) {
          const data = await res.json();
          setRecentProducts(data.filter(p => p.tags && p.tags.toLowerCase().includes('new arrival'))); // Filter new arrivals for the "New Arrivals" section

          // Filter featured products (e.g. with 'Trending' or just top 4)
          const trending = data.filter(p => p.tags && p.tags.toLowerCase().includes('trending'));
          setFeaturedCarousel(trending.length >= 4 ? trending.slice(0, 4) : data.slice(0, 4)); // Use trending or first 4 for carousel
        }
      } catch (error) {
        console.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiUrl]);

  // Auto-scroll carousel every 4 seconds
  useEffect(() => {
    if (featuredCarousel.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % featuredCarousel.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredCarousel]);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>

        {/* Carousel Background layer */}
        {featuredCarousel.length > 0 && (
          <div
            className={styles.carouselBackground}
            style={{ backgroundImage: `url(${featuredCarousel[carouselIndex]?.photos[0] || ''})` }}
          />
        )}

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroTextContent}>
            <h1 className={styles.title}>
              Elevate Your <br />
              <span className={styles.highlight}>Wardrobe</span>
            </h1>
            <p className={styles.subtitle}>
              Discover premium, hand-picked garments designed to make you feel as good as you look.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/category/men" className="btn-primary">Shop Men</Link>
              <Link href="/category/women" className="btn-secondary">Shop Women</Link>
            </div>
          </div>

          {/* Active Carousel Card */}
          {featuredCarousel.length > 0 && !loading && (
            <div className={styles.carouselContainer}>
              <ProductCard product={featuredCarousel[carouselIndex]} />
              <div className={styles.carouselIndicators}>
                {featuredCarousel.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.indicatorDot} ${idx === carouselIndex ? styles.activeDot : ''}`}
                    onClick={() => setCarouselIndex(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.featured}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>New Arrivals</h2>
            <div className={styles.line}></div>
          </div>

          <div className={styles.productGrid}>
            {loading ? (
              <SkeletonLoader type="card" count={4} />
            ) : recentProducts.length > 0 ? (
              recentProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className={styles.noProducts}>No products found. Check back later!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
