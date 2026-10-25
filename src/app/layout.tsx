import type { Metadata } from 'next';
import { Audiowide, Rajdhani, Share_Tech_Mono } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/themes.css';
import '../styles/hud-base.css';
import '../styles/bg-glitch.css';
import '../styles/motion.css';
import '../styles/font-scale.css';
import '../styles/sheet-role-themes.css';
import './globals.css';
import { BgGlitch } from '../components/layout/BgGlitch';
import { Providers } from '../components/layout/Providers';

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
      {/* cp-arg: fragment jack lives on /account — sync handshake NC-SHARD-SYNC when crystals align */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem('cp-theme');var ok=['matrix','hotline','arasaka','netwatch','edgerunners','amber'];var sec=['blackwall','militech','traumateam'];var unlocked=[];try{var u=localStorage.getItem('cp-theme-unlocks');if(u)unlocked=JSON.parse(u)||[];}catch(e2){}if(t==='night'||!t){d.removeAttribute('data-theme');}else if(ok.indexOf(t)>=0){d.setAttribute('data-theme',t);}else if(sec.indexOf(t)>=0&&unlocked.indexOf(t)>=0){d.setAttribute('data-theme',t);}var m=localStorage.getItem('cp-motion');if(m==='on'||m==='off'){d.setAttribute('data-motion',m);}else if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-motion','off');}else{d.setAttribute('data-motion','on');}var s=localStorage.getItem('cp-sound');if(s==='on'||s==='off'){d.setAttribute('data-sound',s);}else{d.setAttribute('data-sound','on');}var f=localStorage.getItem('cp-font');if(f==='md'||f==='lg'){d.setAttribute('data-font',f);}else{d.setAttribute('data-font','md');}}catch(e){}})();`,
        }}
      />
      <BgGlitch />
      <Providers>{children}</Providers>
      <script
        dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
        }}
      />
    </body>
  </html>
);

export default RootLayout;
