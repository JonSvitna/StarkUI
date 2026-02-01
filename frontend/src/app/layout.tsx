import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StarkUI - Tony Stark Cockpit',
  description: 'AI Agent Dashboard with real-time monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-stark-bg via-stark-bg to-slate-950">
          {children}
        </div>
      </body>
    </html>
  );
}
