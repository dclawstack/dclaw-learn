import type { Metadata } from 'next';
import './globals.css';
import NavBar from './NavBar';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata: Metadata = {
  title: 'DClaw Learn',
  description: 'Adaptive learning that works',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
        <ThemeProvider>
          <NavBar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
