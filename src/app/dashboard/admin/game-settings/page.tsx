import { CONFIG } from 'src/config-global';

import { GameSettingsView } from 'src/sections/dashboard/game-settings';

// ----------------------------------------------------------------------

export const metadata = { title: `Game Settings | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <GameSettingsView />;
}
