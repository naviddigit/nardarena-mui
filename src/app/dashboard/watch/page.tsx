import type { Metadata } from 'next';

import LiveGamesView from 'src/sections/dashboard/live-games-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Live Games - Nard Arena',
};

export default function LiveGamesPage() {
  return <LiveGamesView />;
}
