'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  username: string;
  displayName: string;
  avatar?: string;
  country?: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<any> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { access_token, refresh_token, user } = res.data;

    if (!access_token) {
      throw new Error('Access token not found in response');
    }

    setSession(access_token);
    
    // Store refresh token for auto-refresh system
    if (refresh_token) {
      sessionStorage.setItem('jwt_refresh_token', refresh_token);
      sessionStorage.setItem('refreshToken', refresh_token); // Backwards compatibility
    }
    
    return user; // Return user data including role
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  username,
  displayName,
  avatar,
  country,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    username,
    displayName,
    ...(avatar && { avatar }),
    ...(country && { country }),
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { access_token, refresh_token } = res.data;

    if (!access_token) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(STORAGE_KEY, access_token);
    
    // Store refresh token for auto-refresh system
    if (refresh_token) {
      sessionStorage.setItem('jwt_refresh_token', refresh_token);
      sessionStorage.setItem('refreshToken', refresh_token); // Backwards compatibility
    }
  } catch (error) {
    console.error('Error during sign up:', error);
    console.error('Error response data:', error?.response?.data);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
    
    // Clear refresh token as well
    sessionStorage.removeItem('jwt_refresh_token');
    sessionStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
