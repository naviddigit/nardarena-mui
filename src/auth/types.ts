export type UserType = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED';
} | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
