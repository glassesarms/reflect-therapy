import '../styles/globals.css';
import type { ReactNode } from 'react';
import { Jost } from 'next/font/google';

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-sans'
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
