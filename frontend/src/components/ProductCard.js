'use client';
import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
    const cardRef = useRef(null);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        // Disable on touch devices
        if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;

        if (!cardRef.current) return;
        const card = cardRef.current;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;

        // Calculate rotation between -15 and 15 degrees based on mouse position
        const rotateY = ((x - box.width / 2) / box.width) * 30;
        const rotateX = ((box.height / 2 - y) / box.height) * 30;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const handleCardClick = () => {
        router.push(`/product/${product.id}`);
    };

    const handleAddWithAnimation = (e) => {
        e.stopPropagation();

        if (cardRef.current) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const clone = document.createElement('div');

            // Replicate image aspect exactly over the card before flying
            clone.style.backgroundImage = `url(${currentImage})`;
            clone.style.backgroundSize = 'cover';
            clone.style.backgroundPosition = 'center';
            clone.style.position = 'fixed';
            clone.style.left = `${cardRect.left}px`;
            clone.style.top = `${cardRect.top}px`;
            clone.style.width = `${cardRect.width}px`;
            clone.style.height = `${cardRect.height}px`;
            clone.className = 'flying-item';

            document.body.appendChild(clone);

            setTimeout(() => {
                clone.remove();
            }, 800);
        }

        addToCart(product);
    };

    const fotos = Array.isArray(product.photos) ? product.photos : [];
    const currentImage = isHovered && fotos.length > 1 ? fotos[1] : (fotos.length > 0 ? fotos[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800');

    return (
        <div className={styles.perspectiveContainer}>
            <div
                ref={cardRef}
                className={`glass-panel ${styles.card} rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 relative group bg-white hover:-translate-y-2`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleCardClick}
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    cursor: 'pointer',
                    transformStyle: 'preserve-3d',
                    borderColor: 'rgba(0,0,0,0.05)'
                }}
            >
                {/* Mobile Quick Add Plus Button */}
                <button
                    className="absolute top-4 right-4 z-20 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md md:hidden font-bold transition-transform active:scale-95"
                    onClick={handleAddWithAnimation}
                >
                    +
                </button>

                <div className={`${styles.imageContainer} rounded-t-2xl overflow-hidden`}>
                    <div
                        className={`${styles.image} transition-all duration-500`}
                        style={{ backgroundImage: `url(${currentImage})`, backgroundSize: 'cover' }}
                    />
                    {product.discount_percentage > 0 && (
                        <div className={styles.discountBadge}>{product.discount_percentage}% OFF</div>
                    )}
                </div>
                <div className={`${styles.content} bg-white rounded-b-2xl p-4`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className={styles.title}>{product.name}</h3>
                        {user && user.is_admin && (
                            <button className={`btn-secondary ${styles.editBtn}`} onClick={(e) => { e.stopPropagation(); window.location.href = `/admin/products/edit/${product.id}`; }}>Edit</button>
                        )}
                    </div>
                    <div className={styles.priceContainer}>
                        <p className={styles.price} style={{ color: '#1A1A1A' }}>${product.discount_price?.toFixed(2)}</p>
                        {product.discount_percentage > 0 && (
                            <p className={styles.mrp} style={{ color: '#A89ACD' }}>${product.mrp?.toFixed(2)}</p>
                        )}
                        {user?.is_admin && (
                            <button
                                className={`btn-secondary ${styles.editBtn}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/admin/products/edit/${product.id}`;
                                }}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    {/* Desktop Quick Add Button, visible on hover using group-hover */}
                    <button
                        className={`absolute bottom-4 left-4 right-4 bg-black text-white hover:bg-gray-800 font-bold py-3 rounded-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:block shadow-lg`}
                        onClick={handleAddWithAnimation}
                    >
                        Quick Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
