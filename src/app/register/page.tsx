import { CONFIG } from 'src/config-global';

import { AuthContainerView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export const metadata = { title: `Register - ${CONFIG.site.name}` };

export default function Page() {
  return <AuthContainerView />;
}
