import { useLocation } from '@remix-run/react';
import { useEffect, useRef } from 'react';

export const useScrollToParagraph = (paragraphId?: string) => {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (`#${paragraphId}` === location.hash) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [paragraphId, location]);

  return { ref };
};
