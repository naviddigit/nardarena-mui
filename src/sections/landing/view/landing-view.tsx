'use client';

import { LandingHero } from '../landing-hero';
import { LandingTrust } from '../landing-trust';
import { LandingFeatures } from '../landing-features';
import { LandingGameModes } from '../landing-game-modes';
import { LandingEarnings } from '../landing-earnings';
import { LandingHowItWorks } from '../landing-how-it-works';
import { LandingFAQ } from '../landing-faq';
import { LandingCTA } from '../landing-cta';
import { LandingFooter } from '../landing-footer';
import { LandingHeader } from '../landing-header';

// ----------------------------------------------------------------------

export function LandingView() {
  return (
    <div style={{ overflowX: 'hidden' }}>
      <LandingHeader />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'NardArena',
            description:
              'Play backgammon online with AI, compete globally, and earn cryptocurrency rewards. Watch tournaments, predict outcomes, and enjoy secure crypto payments.',
            url: 'https://nardarena.com',
            applicationCategory: 'Game',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            operatingSystem: 'Web Browser',
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
    </div>
  );
}
