import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
    ],
  },
  /**
   * Wallet
   */
  {
    subheader: 'Wallet',
    items: [
      { title: 'Deposit', path: paths.dashboard.deposit, icon: ICONS.banking },
      { title: 'Withdraw', path: paths.dashboard.withdraw, icon: ICONS.invoice },
    ],
  },
  /**
   * Game
   */
  {
    subheader: 'Game',
    items: [
      { title: 'Play AI', path: '/game/ai', icon: ICONS.ecommerce },
      { title: 'Online Game', path: paths.dashboard.two, icon: ICONS.chat },
      { title: 'Tournaments', path: paths.dashboard.three, icon: ICONS.analytics },
    ],
  },
  /**
   * Admin Panel
   */
  {
    subheader: 'Admin',
    items: [
      {
        title: 'Admin Panel',
        path: paths.dashboard.admin.root,
        icon: ICONS.user,
        children: [
          { title: 'Dashboard', path: paths.dashboard.admin.root },
          { title: 'Users', path: paths.dashboard.admin.users },
          { title: 'Games', path: paths.dashboard.admin.games },
          { title: 'Wallet Settings', path: paths.dashboard.admin.walletSettings },
          { title: 'Game Settings', path: paths.dashboard.admin.gameSettings },
          { title: 'Database', path: paths.dashboard.admin.database },
        ],
      },
    ],
  },
];
