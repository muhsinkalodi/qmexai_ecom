'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './login.module.css';
import Link from 'next/link';

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get('registered') === 'true';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const result = await login(email, password);
        if (result.success) {
            if (result.is_admin) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className={styles.loginContainer}>
            <form className={`glass-panel ${styles.formBox}`} onSubmit={handleLogin}>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>Sign in to Qmexai to continue.</p>

                {justRegistered && !error && (
                    <div className={styles.successBanner} style={{ backgroundColor: 'rgba(69, 162, 158, 0.1)', color: '#45A29E', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(69,162,158,0.2)' }}>
                        Account created successfully! Please sign in.
                    </div>
                )}

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.inputField}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.inputField}
                    />
                </div>

                <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                <p className={styles.switchPrompt} style={{ marginTop: '20px', textAlign: 'center', color: '#C5C6C7', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/register" style={{ color: '#66FCF1', textDecoration: 'none' }}>Create one</Link>
                </p>
            </form>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
