import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Applies the persisted (or system-preferred) theme to <html> before first
 * paint so dark mode never flashes the light theme on reload. Runs before
 * React hydrates; themeStore uses the same storage key ('theme').
 */
const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (error) {}
})();
`;

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}