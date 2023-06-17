import { useLocation } from '@remix-run/react';

export const useParagraphIds = () => {
  const location = useLocation();
  const urlSearchParams = new URLSearchParams(location.search);
  return urlSearchParams.getAll('p');
};
