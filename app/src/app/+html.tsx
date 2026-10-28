import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { SKINS, skinCss } from '@/theme';

// Runs only at build time: the HTML wrapper around every page.
const css = `
${skinCss()}
body { background-color: var(--sb-bg); }
* { font-family: var(--sb-fontBody) !important; }
[data-display], [data-display] * { font-family: var(--sb-fontDisplay) !important; font-weight: var(--sb-displayWeight) !important; letter-spacing: var(--sb-displaySpacing) !important; }
[data-display="title"] { font-style: var(--sb-titleStyle) !important; }
[data-btn] { font-family: var(--sb-fontButton) !important; font-weight: var(--sb-buttonWeight) !important; font-size: var(--sb-buttonSize) !important; }
input, textarea { outline: none; }
`;

// Applies the saved skin before anything is drawn, so there is no flash of the wrong look.
const applySkin = `try{var s=localStorage.getItem('sb-skin');if(s==='butik'||s==='stiker'){document.documentElement.setAttribute('data-skin',s);var m=document.querySelector('meta[name=theme-color]');if(m)m.content=${JSON.stringify(Object.fromEntries(Object.entries(SKINS).map(([k, t]) => [k, t.browserBar])))}[s]}}catch(e){}`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="Spirit Belongings: Checkout palsu. Dompet aman." />
        <meta property="og:description" content="Beli barang impianmu tanpa keluar uang beneran." />
        <meta property="og:image" content="https://spirit-belongings.eoi-apps.my.id/icon-512.png" />
        <meta
          name="description"
          content="Checkout palsu. Dompet aman. Beli barang impianmu tanpa keluar uang beneran."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Bodoni+Moda:ital,wght@0,500;0,700;1,500&family=Fredoka:wght@500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: applySkin }} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
