import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Fallback client-side redirect if not served directly via rewrite
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.location.replace('/index.html');
    }
  }, []);

  return null;
}
