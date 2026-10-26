'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CreateRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/campaigns');
  }, [router]);

  return null;
};

export default CreateRedirectPage;
