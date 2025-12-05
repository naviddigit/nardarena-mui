// ----------------------------------------------------------------------

const ROOTS = {
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    signIn: '/login',
    signUp: '/register',
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    deposit: `${ROOTS.DASHBOARD}/deposit`,
    withdraw: `${ROOTS.DASHBOARD}/withdraw`,
    rankings: `${ROOTS.DASHBOARD}/rankings`,
    gameHistory: `${ROOTS.DASHBOARD}/game-history`,
    two: `${ROOTS.DASHBOARD}/two`,
    three: `${ROOTS.DASHBOARD}/three`,
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
    admin: {
      root: `${ROOTS.DASHBOARD}/admin`,
      users: `${ROOTS.DASHBOARD}/admin/users`,
      botUsers: `${ROOTS.DASHBOARD}/admin/bot-users`,
      games: `${ROOTS.DASHBOARD}/admin/games`,
      walletSettings: `${ROOTS.DASHBOARD}/admin/wallet-settings`,
      gameSettings: `${ROOTS.DASHBOARD}/admin/game-settings`,
      database: `${ROOTS.DASHBOARD}/admin/database`,
    },
  },
};
