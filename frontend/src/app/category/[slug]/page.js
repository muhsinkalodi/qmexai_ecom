'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '../../../components/ProductCard';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { useAuth } from '../../../context/AuthContext';
import styles from '../../page.module.css';

export default function CategoryPage() {
    const { slug } = useParams();
    const { apiUrl } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Normalize slug for UI
    const categoryTitle = slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Shop';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${apiUrl}/products/`);
                if (res.ok) {
                    const data = await res.json();
                    // Filter by category or tag
                    const filtered = data.filter(p => {
                        if (slug === 'new-arrivals') {
                            return p.tags && p.tags.toLowerCase().includes('new arrival');
                        }
                        return p.category && p.category.toLowerCase() === slug.toLowerCase();
                    });
                    setProducts(filtered);
                }
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [apiUrl, slug]);

    return (
        <div className={styles.homeContainer}>
            <section className={styles.hero} style={{ minHeight: '40vh' }}>
                <div className={styles.heroGlow}></div>
                <div className={`container ${styles.heroContent}`}>
                    <h1 className={styles.title}>
                        Shop <span className={styles.highlight}>{categoryTitle}</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Explore our curated collection of {categoryTitle} premium fashion.
                    </p>
                </div>
            </section>

            <section className={styles.featured}>
                <div className="container">
                    <div className={styles.productGrid}>
                        {loading ? (
                            <SkeletonLoader type="card" count={8} />
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <p className={styles.noProducts}>No items found in {categoryTitle}. Check back soon!</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
