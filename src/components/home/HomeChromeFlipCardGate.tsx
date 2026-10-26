'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { HomeChromeFlipCardSkeleton } from './HomeChromeFlipCardSkeleton';

const HomeChromeFlipCard = dynamic(
  () => import('./HomeChromeFlipCard').then((m) => m.HomeChromeFlipCard),
  { ssr: false, loading: () => <HomeChromeFlipCardSkeleton /> },
);

/**
 * Never render the flip card (or its catalog module) until after client mount.
 * Pairs with dynamic ssr:false so server + first client paint stay on the skeleton.
 */
export const HomeChromeFlipCardGate = () => {
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  if (!clientReady) {
    return <HomeChromeFlipCardSkeleton />;
  }

  return <HomeChromeFlipCard />;
};
