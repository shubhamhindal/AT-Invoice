import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientThemeProvider from '@/components/ClientThemeProvider';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice App',
  description: 'Simple Invoicing for Small Businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientThemeProvider>{children}</ClientThemeProvider>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}