import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect } from 'react';
import type { Glossary } from '~/types';

export const useGlossary = ({
  searchTerm,
  setFilterValue,
  setGlossaries,
  setFilteredGlossaries,
}: {
  searchTerm: string;
  setFilterValue: (value: string) => void;
  setGlossaries: (glossaries: Glossary[]) => void;
  setFilteredGlossaries: (glossaries: Glossary[]) => void;
}) => {
  const fetcher = useFetcher<{ glossaries: Glossary[] }>();

  useEffect(() => {
    if (!fetcher.data || fetcher.state === 'loading' || fetcher.state === 'submitting') {
      return;
    }

    if (fetcher.data) {
      setGlossaries(fetcher.data.glossaries);
      setFilteredGlossaries(fetcher.data.glossaries);
    }
  }, [fetcher.data, fetcher.state, setGlossaries, setFilteredGlossaries]);

  const onSearch = useCallback(() => {
    if (searchTerm === '') {
      fetcher.load('/glossary');
      setGlossaries([]);
      setFilterValue('');
    } else {
      fetcher.load(`/glossary?search=${searchTerm}`);
    }
  }, [searchTerm, fetcher, setGlossaries, setFilterValue]);

  return { onSearch };
};
