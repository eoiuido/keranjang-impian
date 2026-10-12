import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Runs only at build time: the HTML wrapper around every page.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F7C6D9" />
        <meta
          name="description"
          content="Checkout palsu. Dompet aman. Beli barang impianmu tanpa keluar uang beneran."
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: 'body{background-color:#FFF8FB;}' }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
