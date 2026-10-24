import type { Metadata } from 'next';
import { Audiowide, Rajdhani, Share_Tech_Mono } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/themes.css';
import '../styles/hud-base.css';
import '../styles/bg-glitch.css';
import '../styles/motion.css';
import './globals.css';
import { BgGlitch } from '../components/layout/BgGlitch';

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

const audiowide = Audiowide({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-audiowide',
});

export const metadata: Metadata = {
  title: 'Cyberpunk Storyteller',
  description: 'Mesa digital Night City × Storyteller',
  manifest: '/manifest.json',
  themeColor: '#0a0a0a',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR">
    <body
      className={`${rajdhani.variable} ${shareMono.variable} ${audiowide.variable}`}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('cp-theme');var ok=['matrix','hotline','arasaka','netwatch','edgerunners','amber'];if(t&&ok.indexOf(t)>=0)d.setAttribute('data-theme',t);var m=localStorage.getItem('cp-motion');if(m==='on'||m==='off'){d.setAttribute('data-motion',m);}else if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-motion','off');}else{d.setAttribute('data-motion','on');}}catch(e){}})();`,
        }}
      />
      <BgGlitch />
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
