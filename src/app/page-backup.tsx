import type { Metadata } from 'next';

import { SimpleLayout } from 'src/layouts/simple';

import { LandingView } from 'src/sections/landing/view/landing-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'NardArena - Play Backgammon Online | Earn Crypto by Playing & Watching',
  description:
    'Play backgammon online with AI or real players. Earn crypto (TRX, BNB) by playing, watching games, and predicting winners. Join international tournaments and compete globally.',
  keywords: [
    'backgammon',
    'nard game',
    'play backgammon online',
    'crypto gaming',
    'earn crypto',
    'blockchain game',
    'play to earn',
    'watch to earn',
    'TRX payment',
    'BNB payment',
    'AI backgammon',
    'online tournament',
    'predict and earn',
    'gaming rewards',
  ],
  authors: [{ name: 'NardArena' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nardarena.com',
    siteName: 'NardArena',
    title: 'NardArena - Play Backgammon Online & Earn Crypto',
    description:
      'International backgammon gaming platform. Play with AI or players, earn crypto by playing and watching. TRX & BNB payments accepted.',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NardArena - Play Backgammon Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NardArena - Play Backgammon Online & Earn Crypto',
    description:
      'Play backgammon with AI or players. Earn crypto by playing, watching, and predicting winners.',
    images: ['/assets/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <SimpleLayout
      content={{
        compact: true,
      }}
    >
      <LandingView />
    </SimpleLayout>
  );
}
