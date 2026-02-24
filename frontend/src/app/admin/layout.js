'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './adminLayout.module.css';

export default function AdminLayout({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (!user.is_admin) {
                router.push('/');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user || !user.is_admin) {
        return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Verifying Admin Access...</div>;
    }

    return (
        <div className={styles.adminContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navLink}>
                        Dashboard
                    </Link>
                    <Link href="/admin/products" className={styles.navLink}>
                        Products
                    </Link>
                    <Link href="/admin/orders" className={styles.navLink}>
                        Manage Orders
                    </Link>
                    <Link href="/" className={styles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        Back to Store
                    </Link>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
