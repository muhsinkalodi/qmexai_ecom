'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import styles from '../../adminProducts.module.css';

export default function EditProduct() {
    const { id } = useParams();
    const router = useRouter();
    const { apiUrl, token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        name: '', description: '', category: 'Men', tags: '',
        mrp: '', discount_percentage: '', discount_price: '',
        photos: '', stock: '', color: '', fabric: '', rating: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${apiUrl}/products/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        category: data.category || 'Men',
                        tags: data.tags || '',
                        mrp: data.mrp || '',
                        discount_percentage: data.discount_percentage || 0,
                        discount_price: data.discount_price || 0,
                        photos: data.photos ? data.photos.join(', ') : '',
                        stock: data.stock || 0,
                        color: data.color || '',
                        fabric: data.fabric || '',
                        rating: data.rating || 0
                    });
                } else {
                    setMessage({ type: 'error', text: 'Product not found.' });
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Network Error.' });
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProduct();
    }, [id, apiUrl]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        const photosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url !== '');

        if (photosArray.length !== 4) {
            setMessage({ type: 'error', text: 'You must provide exactly 4 image URLs.' });
            setSubmitting(false);
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
            const res = await fetch(`${apiUrl}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Product updated successfully!' });
                setTimeout(() => router.push('/'), 1500); // Redirect to storefront after success
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Update failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '100px 0' }}><h2>Loading Editor...</h2></div>;

    const currentPhotosArray = formData.photos.split(',').map(url => url.trim()).filter(url => url !== '');
    const isPhotosValid = currentPhotosArray.length === 4;

    return (
        <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
            <h1 style={{ marginBottom: '24px' }}>Edit Product #{id}</h1>

            {message && (
                <div className={`${styles.alert} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={`glass-panel ${styles.panel}`}>
                <form onSubmit={handleUpdate} className={styles.form}>
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
                            <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className={styles.input} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Color</label>
                            <input type="text" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fabric</label>
                            <input type="text" value={formData.fabric} onChange={e => setFormData({ ...formData, fabric: e.target.value })} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Rating (0-5)</label>
                            <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className={styles.input} />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>MRP (₹)</label>
                            <input required type="number" step="0.01" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Discount %</label>
                            <input type="number" step="0.01" value={formData.discount_percentage} onChange={e => setFormData({ ...formData, discount_percentage: e.target.value })} className={styles.input} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Manual Price (₹)</label>
                            <input type="number" step="0.01" value={formData.discount_price} onChange={e => setFormData({ ...formData, discount_price: e.target.value })} className={styles.input} />
                        </div>
                    </div>

                    <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
                        <label>Stock</label>
                        <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className={styles.input} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Photos (Comma separated URLs)</label>
                        <textarea required rows="3" value={formData.photos} onChange={e => setFormData({ ...formData, photos: e.target.value })} className={styles.input} />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button type="submit" className="btn-primary" disabled={submitting || !isPhotosValid}>
                            {submitting ? 'Saving...' : !isPhotosValid ? `Provide Exactly 4 Images (${currentPhotosArray.length}/4)` : 'Save Changes'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => router.push('/')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
