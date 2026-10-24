'use client';

import { ReactNode } from 'react';
import { AppShell } from './AppShell';

export const PageFrame = ({ children }: { children: ReactNode }) => (
  <AppShell>{children}</AppShell>
);

export default PageFrame;
