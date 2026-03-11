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
        <div className="bg-[#f1f3f6] min-h-screen pb-12">
            {/* Main Content Container (White Mega block) */}
            <div className="max-w-[1400px] mx-auto bg-white mt-4 shadow-sm min-h-[80vh]">
                <div className="flex flex-col md:flex-row">

                    {/* LEFT COLUMN: Sticky Photos (40%) */}
                    <div className="w-full md:w-[40%] border-r border-gray-200 p-4 relative">
                        <div className="sticky top-[120px] flex gap-4">
                            {/* Vertical Thumbnails */}
                            <div className="hidden md:flex flex-col gap-2">
                                {displayPhotos.map((photo, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-16 h-16 border-2 cursor-pointer transition-all ${activeImage === photo ? 'border-[#2874f0]' : 'border-gray-100 hover:border-gray-300'}`}
                                        style={{ backgroundImage: `url(${photo})`, backgroundSize: 'cover' }}
                                        onClick={() => setActiveImage(photo)}
                                    />
                                ))}
                            </div>

                            {/* Main Image Viewer */}
                            <div className="flex-1">
                                <div className="w-full aspect-[4/5] border border-gray-100 relative group overflow-hidden cursor-crosshair flex items-center justify-center">
                                    {!imgLoaded && <SkeletonLoader type="card" />}
                                    <img
                                        src={activeImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'}
                                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-150"
                                        style={{ display: imgLoaded ? 'block' : 'none' }}
                                        onLoad={() => setImgLoaded(true)}
                                        alt={product.name}
                                    />
                                    {product.discount_percentage > 0 && (
                                        <div className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-2 py-1 flex items-center justify-center rounded-full w-10 h-10 shadow-md">
                                            {product.discount_percentage}%
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-4 w-full">
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="flex-1 bg-[#ff9f00] text-white py-4 font-bold rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                                        disabled={product.stock <= 0}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" /></svg>
                                        ADD TO CART
                                    </button>
                                    <button className="flex-1 bg-[#fb641b] text-white py-4 font-bold rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg>
                                        BUY NOW
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Dense Specifications (60%) */}
                    <div className="w-full md:w-[60%] p-6 md:p-8">
                        <div className="text-gray-500 text-sm mb-2">{product.category} &gt; {product.tags}</div>
                        <h1 className="text-2xl text-[#212121] mb-2">{product.name} - Premium {product.fabric}</h1>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-sm flex items-center font-bold">
                                {product.rating > 0 ? product.rating.toFixed(1) : '4.5'} <span className="text-[10px] ml-1">★</span>
                            </span>
                            <span className="text-sm text-gray-400 font-semibold cursor-pointer hover:text-[#2874f0]">12,453 Ratings & 1,294 Reviews</span>
                            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/fa_62673a.png" className="h-5 ml-4" alt="assured" />
                        </div>

                        {/* Pricing block */}
                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-3xl font-bold text-[#212121]">₹{product.discount_price?.toFixed(0)}</span>
                            {product.discount_percentage > 0 && (
                                <>
                                    <span className="text-lg text-[#878787] line-through">₹{product.mrp?.toFixed(0)}</span>
                                    <span className="text-md text-[#388e3c] font-bold">{product.discount_percentage}% off</span>
                                </>
                            )}
                        </div>

                        {/* Available Offers Box */}
                        <div className="mb-8">
                            <h3 className="text-[16px] font-semibold mb-3">Available offers</h3>
                            <ul className="text-sm flex flex-col gap-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#388e3c] mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg></span>
                                    <span><span className="font-semibold">Bank Offer</span> 5% Cashback on Qmexai Axis Bank Card <span className="text-[#2874f0] cursor-pointer">T&C</span></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#388e3c] mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg></span>
                                    <span><span className="font-semibold">Special Price</span> Get extra 10% off (price inclusive of cashback/coupon) <span className="text-[#2874f0] cursor-pointer">T&C</span></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#388e3c] mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" /></svg></span>
                                    <span><span className="font-semibold">Partner Offer</span> Make a purchase and win a surprise cashback coupon <span className="text-[#2874f0] cursor-pointer">Know More</span></span>
                                </li>
                            </ul>
                        </div>

                        {/* Fake Delivery Check */}
                        <div className="flex items-center gap-10 mb-8 pb-8 border-b border-gray-100">
                            <span className="text-[#878787] text-sm font-semibold w-20">Delivery</span>
                            <div className="flex-1 max-w-[300px]">
                                <div className="border-b-2 border-[#2874f0] pb-1 flex justify-between">
                                    <span className="text-sm font-semibold flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-[#2874f0]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                                        Mumbai 400001
                                    </span>
                                    <span className="text-[#2874f0] text-sm font-bold cursor-pointer">Change</span>
                                </div>
                                <div className="text-sm mt-3 flex items-start gap-2">
                                    <span className="font-semibold">Delivery by 14 Aug | <span className="text-green-600 line-through">₹40</span> Free</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">if ordered before 4:00 PM</div>
                            </div>
                        </div>

                        {/* Variants Strip */}
                        {variants.length > 0 && (
                            <div className="flex gap-10 mb-8">
                                <span className="text-[#878787] text-sm font-semibold w-20 pt-2">Color</span>
                                <div className="flex gap-3">
                                    <div className="border-2 border-[#2874f0] p-0.5 cursor-pointer">
                                        <img src={displayPhotos[0]} className="w-12 h-16 object-cover" title={product.color} alt={product.color} />
                                    </div>
                                    {variants.map(v => (
                                        <div
                                            key={v.id}
                                            className="border border-gray-200 hover:border-[#2874f0] p-0.5 cursor-pointer transition-colors"
                                            onClick={() => router.push(`/product/${v.id}`)}
                                        >
                                            <img src={v.photos?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80'} className="w-12 h-16 object-cover" title={v.color} alt={v.color} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Structured Specifications Table */}
                        <div className="mt-8 border border-gray-200 rounded-sm overflow-hidden">
                            <div className="text-lg font-bold px-6 py-4 border-b border-gray-200 bg-gray-50">Specifications</div>

                            <div className="px-6 py-4">
                                <div className="text-[16px] mb-4">General</div>
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b border-gray-100 flex p-3">
                                            <td className="text-[#878787] w-[30%]">Material</td>
                                            <td className="text-[#212121]">{product.fabric || '100% Premium Cotton'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 flex p-3 bg-gray-50">
                                            <td className="text-[#878787] w-[30%]">Color</td>
                                            <td className="text-[#212121]">{product.color || 'Standard Fit'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 flex p-3">
                                            <td className="text-[#878787] w-[30%]">Style Code</td>
                                            <td className="text-[#212121]">QMEX-{product.id}-2024</td>
                                        </tr>
                                        <tr className="flex p-3 bg-gray-50">
                                            <td className="text-[#878787] w-[30%]">Ideal For</td>
                                            <td className="text-[#212121]">{product.category === 'Men' || product.category === 'Women' ? product.category : 'Unisex'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Swiper - Similar Products */}
            {suggested.length > 0 && (
                <div className="max-w-[1400px] mx-auto bg-white mt-4 shadow-sm p-4 md:p-6 mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl md:text-2xl font-bold">Similar Products</h2>
                        <span className="bg-[#2874f0] cursor-pointer text-white px-4 py-2 font-semibold shadow-sm text-sm">VIEW ALL</span>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                        {suggested.map(item => (
                            <div key={item.id} className="snap-start flex-[0_0_240px]">
                                <ProductCard product={item} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
