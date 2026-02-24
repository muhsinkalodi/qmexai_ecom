'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from '../login/login.module.css';
import Link from 'next/link';

export default function Register() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { apiUrl } = useAuth();
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                // Instantly redirect to login so they can auth
                router.push('/login?registered=true');
                return;
            }

            const data = await res.json().catch(() => ({}));
            setError(data.detail || 'Registration failed');

        } catch (err) {
            console.error("Registration fetch error:", err);
            setError('Network error: Unable to reach the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form className={`glass-panel ${styles.formBox}`} onSubmit={handleRegister}>
                <h2>Create Account</h2>
                <p className={styles.subtitle}>Join Qmexai and start shopping.</p>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={styles.inputField}
                        placeholder="John Doe"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={styles.inputField}
                        placeholder="john@example.com"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className={styles.inputField}
                        placeholder="+1 (555) 000-0000"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className={styles.inputField}
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                    {loading ? 'Registering...' : 'Create Account'}
                </button>

                <p className={styles.switchPrompt}>
                    Already have an account? <Link href="/login" className={styles.switchLink}>Sign in</Link>
                </p>
            </form>
        </div>
    );
}
