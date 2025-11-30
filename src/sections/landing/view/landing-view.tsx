'use client';

import Box from '@mui/material/Box';

import { LandingHeader } from '../landing-header';
import { LandingHero } from '../landing-hero';
import { LandingFeatures } from '../landing-features';
import { LandingTrust } from '../landing-trust';
import { LandingGameModes } from '../landing-game-modes';
import { LandingEarnings } from '../landing-earnings';
import { LandingHowItWorks } from '../landing-how-it-works';
import { LandingFAQ } from '../landing-faq';
import { LandingCTA } from '../landing-cta';
import { LandingFooter } from '../landing-footer';

// ----------------------------------------------------------------------

export function LandingView() {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <LandingHeader />
      
      {/* Structured Data for SEO */
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NardArena',
            applicationCategory: 'Game',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            description:
              'Play backgammon online with AI or real players. Earn crypto by playing, watching, and predicting game outcomes.',
            genre: ['Strategy Game', 'Board Game', 'Crypto Gaming'],
            gamePlatform: 'Web Browser',
            playMode: ['MultiPlayer', 'SinglePlayer'],
            keywords:
              'backgammon, nard, crypto gaming, play to earn, watch to earn, TRX, BNB, blockchain game',
          }),
        }}
      />

      <LandingHero />
      <LandingTrust />
      <LandingFeatures />
      <LandingGameModes />
      <LandingEarnings />
      <LandingHowItWorks />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </Box>
  );
}
