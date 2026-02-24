'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Safe Local Storage wrapper
const safeLocalStorage = {
    getItem: (key) => {
        try {
            if (typeof window !== 'undefined') {
                return localStorage.getItem(key);
            }
        } catch (e) {
            console.warn('LocalStorage access denied or error during getItem:', e);
        }
        return null;
    },
    setItem: (key, value) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn('LocalStorage access denied or error during setItem:', e);
        }
    }
};

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = safeLocalStorage.getItem('qmexai_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from localStorage:', e);
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        safeLocalStorage.setItem('qmexai_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item => item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { product_id: product.id, quantity: 1, product }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev => prev.map(item => item.product_id === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => setCartItems([]);

    const toggleCart = () => setIsCartOpen(!isCartOpen);
    const closeCart = () => setIsCartOpen(false);

    const cartTotal = cartItems.reduce((total, item) => total + ((item.product.discount_price || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isCartOpen,
            toggleCart,
            closeCart,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
