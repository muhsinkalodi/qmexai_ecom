'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Safe Local Storage wrapper to prevent SecurityErrors in restricted iframes
const safeLocalStorage = {
    getItem: (key) => {
        try {
            if (typeof window !== 'undefined') return localStorage.getItem(key);
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
        return null;
    },
    setItem: (key, value) => {
        try {
            if (typeof window !== 'undefined') localStorage.setItem(key, value);
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
    },
    removeItem: (key) => {
        try {
            if (typeof window !== 'undefined') localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        return safeLocalStorage.getItem('qmexai_token') || null;
    });
    const [isLoading, setIsLoading] = useState(true);

    // Generate an adaptive API endpoint based on the host so mobile devices ping the network IP, not localhost
    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            // Force client devices to use their current host IP (Solves mobile CORS/Network errors)
            return `http://${window.location.hostname}:8000`;
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    };
    const apiUrl = getBaseUrl();

    useEffect(() => {
        const savedToken = safeLocalStorage.getItem('qmexai_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (authToken) => {
        try {
            const res = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email); // OAuth2 expects username
            formData.append('password', password);

            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });
            if (!res.ok) {
                return { success: false, error: 'Invalid credentials' };
            }
            const data = await res.json();
            setToken(data.access_token);
            safeLocalStorage.setItem('qmexai_token', data.access_token);
            if (typeof window !== 'undefined') {
                document.cookie = `qmexai_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`;
            }
            await fetchUser(data.access_token);
            return { success: true, is_admin: data.is_admin };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        safeLocalStorage.removeItem('qmexai_token');
        if (typeof window !== 'undefined') {
            document.cookie = 'qmexai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isLoading,
            apiUrl
        }}>
            {children}
        </AuthContext.Provider>
    );
};
