'use client';

import type { ReactNode } from 'react';
import { CampaignProvider } from '../../lib/campaign';
import { AuthGate } from './AuthGate';
import { SoundBootstrap } from './SoundBootstrap';

export const Providers = ({ children }: { children: ReactNode }) => (
  <CampaignProvider>
    <SoundBootstrap />
    <AuthGate>{children}</AuthGate>
  </CampaignProvider>
);
