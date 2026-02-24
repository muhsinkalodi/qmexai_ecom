'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import styles from './adminProducts.module.css';

export default function AdminProducts() {
    const { apiUrl, token } = useAuth();

    // Single Product Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Men',
        tags: '',
        mrp: '',
        discount_percentage: '',
        discount_price: '',
        photos: '', // Comma separated mock R2 urls
        stock: '',
        color: '',
        fabric: '',
        rating: ''
    });

    // Bulk Discount Form State
    const [bulkData, setBulkData] = useState({
        category: 'Men',
        discount_percentage: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Parse photos string into array
        const photosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url !== '');

        if (photosArray.length !== 4) {
            setMessage({ type: 'error', text: 'You must provide exactly 4 image URLs.' });
            setLoading(false);
            return;
        }

        const parsedMrp = parseFloat(formData.mrp);
        const parsedDiscountPct = parseFloat(formData.discount_percentage || 0);
        let finalDiscountPrice = parseFloat(formData.discount_price || 0);

        if (finalDiscountPrice === 0 && parsedDiscountPct > 0) {
            finalDiscountPrice = parsedMrp - (parsedMrp * (parsedDiscountPct / 100));
        } else if (finalDiscountPrice === 0 && parsedDiscountPct === 0) {
            finalDiscountPrice = parsedMrp;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            category: formData.category,
            tags: formData.tags,
            mrp: parseFloat(formData.mrp),
            discount_percentage: parsedDiscountPct,
            discount_price: finalDiscountPrice,
            photos: photosArray,
            stock: parseInt(formData.stock, 10),
            color: formData.color,
            fabric: formData.fabric,
            rating: parseFloat(formData.rating || 0)
        };

        try {
            const res = await fetch(`${apiUrl}/products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Product created successfully!' });
                setFormData({
                    name: '', description: '', category: 'Men', tags: '',
                    mrp: '', discount_percentage: '', discount_price: '', photos: '', stock: '',
                    color: '', fabric: '', rating: ''
                });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to create product' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Could not create product.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDiscount = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            category: bulkData.category,
            discount_percentage: parseFloat(bulkData.discount_percentage)
        };

        try {
            const res = await fetch(`${apiUrl}/products/bulk-discount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                setMessage({ type: 'success', text: data.detail });
            } else {
                setMessage({ type: 'error', text: 'Failed to apply bulk discount' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error. Could not apply discount.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSeedDummy = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${apiUrl}/products/seed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Dummy data seeded successfully!' });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to seed data' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error during seeding.' });
        } finally {
            setLoading(false);
        }
    };

    const currentPhotosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url !== '');
    const isPhotosValid = currentPhotosArray.length === 4;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Product Management</h1>
                        <p className={styles.subtitle}>Add new products, dummy data, or manage bulk discounts.</p>
                    </div>
                    <button className={`btn-secondary`} onClick={handleSeedDummy} disabled={loading}>
                        {loading ? 'Processing...' : 'Seed Dummy Products'}
                    </button>
                </div>
            </header>

            {message && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.grid}>
                {/* Create Product Form */}
                <div className={`glass-panel ${styles.panel}`}>
                    <h2>Add New Product</h2>
                    <form onSubmit={handleCreateProduct} className={styles.form}>

                        <div className={styles.inputGroup}>
                            <label>Product Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={styles.input} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Description</label>
                            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={styles.input} />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className={styles.input}>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Kids">Kids</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Tags (Comma separated)</label>
                                <input type="text" placeholder="New Arrival, Trending" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Color (Optional)</label>
                                <input type="text" placeholder="Crimson Red" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className={styles.input} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Fabric/Material (Optional)</label>
                                <input type="text" placeholder="100% Cotton" value={formData.fabric} onChange={e => setFormData({ ...formData, fabric: e.target.value })} className={styles.input} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Base Rating (0-5)</label>
                                <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className={styles.input} placeholder="e.g. 4.8" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>MRP (₹)</label>
                                <input required type="number" step="0.01" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} className={styles.input} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Discount % (Optional)</label>
                                <input type="number" step="0.01" value={formData.discount_percentage} onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })} className={styles.input} placeholder="Leave 0 for none" />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Manual Discount Price (₹) (Optional)</label>
                                <input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({ ...formData, discount_price: e.target.value })} className={styles.input} placeholder="Auto calculated if empty" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Stock</label>
                                <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className={styles.input} />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Photos (Comma separated Cloudflare R2 URLs or external)</label>
                            <textarea required rows="2" value={formData.photos} onChange={e => setFormData({ ...formData, photos: e.target.value })} className={styles.input} placeholder="https://url1.com/img.jpg, https://url2.com/img2.jpg" />
                        </div>

                        <button type="submit" className={`btn-primary`} disabled={loading || !isPhotosValid}>
                            {!isPhotosValid ? `Provide Exactly 4 Images (${currentPhotosArray.length}/4)` : 'Create Product'}
                        </button>
                    </form>
                </div>

                {/* Bulk Discount Form */}
                <div className={`glass-panel ${styles.panel} ${styles.bulkPanel}`}>
                    <h2>Bulk Discount Tool</h2>
                    <p className={styles.helperText}>Apply a percentage discount instantly across an entire category. The backend will recalculate <code>discount_price</code> based on the item's <code>MRP</code> automatically.</p>
                    <form onSubmit={handleBulkDiscount} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Select Category</label>
                            <select value={bulkData.category} onChange={e => setBulkData({ ...bulkData, category: e.target.value })} className={styles.input}>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Kids">Kids</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Discount Percentage (%)</label>
                            <input required type="number" step="0.01" min="0" max="100" value={bulkData.discount_percentage} onChange={e => setBulkData({ ...bulkData, discount_percentage: e.target.value })} className={styles.input} placeholder="e.g. 20" />
                        </div>

                        <button type="submit" className={`btn-primary`} disabled={loading} style={{ backgroundColor: 'var(--danger-color)', backgroundImage: 'none', border: 'none', color: 'white' }}>
                            Apply Bulk Discount
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
