'use client';

import { ReactNode } from 'react';
import { AppShell } from './AppShell';

type PageFrameProps = {
  children: ReactNode;
  landing?: boolean;
};

export const PageFrame = ({ children, landing }: PageFrameProps) => (
  <AppShell landing={landing}>{children}</AppShell>
);

export default PageFrame;
