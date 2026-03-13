'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import SkeletonLoader from '../../../components/SkeletonLoader';
import ProductCard from '../../../components/ProductCard';
import styles from './product.module.css';

export default function ProductDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { apiUrl } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [suggested, setSuggested] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        setImgLoaded(false);
    }, [activeImage]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${apiUrl}/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);

                    const defaultImages = [
                        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1434389678369-182cb1bb3fe8?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=800',
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
                    ];
                    let initialPhotos = Array.isArray(data.photos) && data.photos.length > 0 ? [...data.photos] : [];
                    while (initialPhotos.length < 4) initialPhotos.push(defaultImages[initialPhotos.length]);

                    setActiveImage(initialPhotos[0]);

                    // Fetch suggested products from the same category AND variants
                    const catRes = await fetch(`${apiUrl}/products/`);
                    if (catRes.ok) {
                        const allProds = await catRes.json();

                        // Extract Variants (Same name, different color)
                        const vars = allProds.filter(p => p.name === data.name && p.color && p.id !== data.id);
                        setVariants(vars);

                        // Extract Suggested (Same category, not active, not same name)
                        const filtered = allProds
                            .filter(p => p.category === data.category && p.id !== data.id && p.name !== data.name)
                            .slice(0, 4);
                        setSuggested(filtered);
                    }
                }
            } catch (error) {
                console.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id, apiUrl]);

    if (loading) {
        return (
            <div className={`container ${styles.productContainer}`}>
                <SkeletonLoader type="card" />
            </div>
        );
    }

    if (!product) {
        return <div className="container" style={{ padding: '100px 0' }}><h2>Product not found</h2></div>;
    }

    const defaultImages = [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1434389678369-182cb1bb3fe8?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    ];
    let displayPhotos = Array.isArray(product.photos) && product.photos.length > 0 ? [...product.photos] : [];
    while (displayPhotos.length < 4) displayPhotos.push(defaultImages[displayPhotos.length]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="w-full">
                {/* Desktop Gallery */}
                <div className="hidden md:block w-full">
                    {!imgLoaded && (
                        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                            <SkeletonLoader type="card" />
                        </div>
                    )}
                    <div
                        className={styles.mainImage}
                        style={{
                            backgroundImage: `url(${activeImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'})`,
                            display: imgLoaded ? 'block' : 'none'
                        }}
                    />
                    <img
                        src={activeImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'}
                        style={{ display: 'none' }}
                        onLoad={() => setImgLoaded(true)}
                        alt="product-loader"
                    />

                    <div className={styles.thumbnailGallery}>
                        {displayPhotos.map((photo, idx) => (
                            <div
                                key={idx}
                                className={`${styles.thumbnail} ${activeImage === photo ? styles.activeThumb : ''}`}
                                style={{ backgroundImage: `url(${photo})` }}
                                onClick={() => setActiveImage(photo)}
                            />
                        ))}
                    </div>
                </div>

                {/* Mobile Gallery (Swipeable) */}
                <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-4 -ml-5 px-5" style={{ width: '100vw' }}>
                    {displayPhotos.map((photo, idx) => (
                        <div
                            key={idx}
                            className="snap-center shrink-0 w-[85vw] h-[60vh] rounded-2xl bg-cover bg-center shadow-md relative"
                            style={{ backgroundImage: `url(${photo})` }}
                        >
                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-full">
                                {idx + 1} / 4
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                <h1 className={styles.title}>{product.name}</h1>
                <div className={styles.priceTag}>${product.discount_price?.toFixed(2)}</div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                        {product.description || 'Premium quality material tailored for comfort and durability. The perfect addition to any modern wardrobe.'}
                    </p>
                </div>

                {variants.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3 block">Available Colors</span>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className={`${styles.swatch} ${styles.activeSwatch}`}
                                title={product.color || 'Default'}
                            >
                                {product.color || 'Standard'}
                            </button>
                            {variants.map(v => (
                                <button
                                    key={v.id}
                                    className={styles.swatch}
                                    title={v.color}
                                    onClick={() => router.push(`/product/${v.id}`)}
                                >
                                    {v.color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4">
                    {product.color && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Color</span>
                            <span className="font-medium text-gray-900">{product.color}</span>
                        </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Fabric</span>
                        <span className="font-medium text-gray-900">{product.fabric || 'Premium Cotton'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Rating</span>
                        <span className="font-medium text-gray-900">⭐ {product.rating > 0 ? product.rating.toFixed(1) : '4.5'}</span>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    {product.stock > 0 ? (
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">● In Stock ({product.stock})</span>
                    ) : (
                        <span className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">● Out of Stock</span>
                    )}
                </div>

                <button
                    className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-[0.98] ${product.stock > 0
                            ? "bg-[#1A1A1A] text-white hover:bg-[#A89ACD] hover:shadow-lg hover:-translate-y-1"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                >
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
            </div>

            {suggested.length > 0 && (
                <div className="col-span-1 lg:col-span-2 mt-8 pt-8 border-t border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <div className={styles.productGrid}>
                        {suggested.map(item => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
