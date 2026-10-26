'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Personagens são criados no contexto de uma campanha — hub global desativado. */
const CharactersRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/campaigns');
  }, [router]);

  return null;
};

export default CharactersRedirectPage;
