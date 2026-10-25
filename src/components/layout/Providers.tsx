'use client';

import type { ReactNode } from 'react';
import { CampaignProvider } from '../../lib/campaign';

export const Providers = ({ children }: { children: ReactNode }) => (
  <CampaignProvider>{children}</CampaignProvider>
);
