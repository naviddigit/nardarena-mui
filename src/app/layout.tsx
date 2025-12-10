import 'src/global.css';

// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { ThemeProvider } from 'src/theme/theme-provider';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { SnackbarProvider } from 'src/components/snackbar';
import { TokenRefreshProvider } from 'src/components/token-refresh';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export const metadata = {
  title: 'Nard Arena - تخته نرد آنلاین',
  description: 'بهترین پلتفرم بازی تخته نرد آنلاین با هوش مصنوعی - بازی تخته نرد حرفه‌ای با امکان بازی با AI و بازیکنان واقعی',
  keywords: 'تخته نرد, نرد آنلاین, بازی تخته نرد, backgammon, نرد با هوش مصنوعی, بازی آنلاین',
  authors: [{ name: 'Nard Arena Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nard Arena',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Nard Arena',
    title: 'Nard Arena - تخته نرد آنلاین 🎲',
    description: 'بازی تخته نرد حرفه‌ای با هوش مصنوعی و بازیکنان واقعی',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nard Arena - تخته نرد آنلاین',
    description: 'بازی تخته نرد حرفه‌ای با هوش مصنوعی',
  },
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {getInitColorSchemeScript}

        <AuthProvider>
          <TokenRefreshProvider>
            <SettingsProvider
              settings={settings}
              caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
            >
              <ThemeProvider>
                <MotionLazy>
                  <SnackbarProvider>
                    <ProgressBar />
                    <SettingsDrawer />
                    {children}
                  </SnackbarProvider>
                </MotionLazy>
              </ThemeProvider>
            </SettingsProvider>
          </TokenRefreshProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
