import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SideCart from '../components/SideCart';
import './globals.css';

export const metadata = {
  title: 'Qmexai | Modern Fashion',
  description: 'Premium modern fashion e-commerce webapp built with Next.js and FastAPI.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <SideCart />
            <main className="main-content">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
