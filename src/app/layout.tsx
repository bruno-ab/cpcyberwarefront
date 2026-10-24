import type { Metadata } from 'next';
import { Rajdhani, Share_Tech_Mono } from 'next/font/google';
import '../styles/tokens.css';
import './globals.css';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

const shareMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-mono',
});

export const metadata: Metadata = {
  title: 'Cyberpunk Storyteller',
  description: 'Mesa digital Night City × Storyteller',
  manifest: '/manifest.json',
  themeColor: '#FCEE0A',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR">
    <body className={`${rajdhani.variable} ${shareMono.variable}`}>
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
        }}
      />
    </body>
  </html>
);

export default RootLayout;
