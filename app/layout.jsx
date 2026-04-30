import './globals.css';
import Background from '@/components/Background';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL('https://alife-in-the-wild.github.io/'),
  title: 'Artificial Life in the Wild — ALIFE 2026 Workshop',
  description:
    "A workshop at the 2026 Conference on Artificial Life on bringing ALife out of the simulator and into ecologies, embodiments, and the open world.",
  openGraph: {
    title: 'Artificial Life in the Wild — ALIFE 2026 Workshop',
    description: 'Bringing ALife out of the simulator and into ecologies, embodiments, and the open world.',
    url: 'https://alife-in-the-wild.github.io/',
    type: 'website',
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%230b0d12'/%3E%3Ccircle cx='16' cy='16' r='6' fill='none' stroke='%23bfe6c9' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='16' r='1.4' fill='%23bfe6c9'/%3E%3C/svg%3E",
  },
};

export const viewport = {
  themeColor: '#0b0d12',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..700,30..100,0..1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Background />
        <Header />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
