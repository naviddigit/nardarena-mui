'use client';

import type { ReactNode } from 'react';

import { Snackbar } from './snackbar';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export function SnackbarProvider({ children }: Props) {
  return (
    <>
      {children}
      <Snackbar />
    </>
  );
}
