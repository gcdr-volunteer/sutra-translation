import { useFetcher } from '@remix-run/react';
import { useCallback, useEffect } from 'react';
import type { Glossary } from '~/types';

export const useGlossary = ({
  searchTerm,
  setFilterValue,
  setGlossaries,
  setFilteredGlossaries,
  setNextPage,
}: {
  searchTerm: string;
  setFilterValue: (value: string) => void;
  setNextPage: (value: string | undefined | null) => void;
  setGlossaries: (glossaries: Glossary[]) => void;
  setFilteredGlossaries: (glossaries: Glossary[]) => void;
}) => {
  const fetcher = useFetcher<{ glossaries: Glossary[]; nextPage: string | undefined | null }>();

  useEffect(() => {
    if (!fetcher.data || fetcher.state === 'loading' || fetcher.state === 'submitting') {
      return;
    }

    if (fetcher.data) {
      setFilterValue('');
      setGlossaries(fetcher.data.glossaries);
      setFilteredGlossaries(fetcher.data.glossaries);
      setNextPage(fetcher.data.nextPage);
    }
  }, [
    fetcher.data,
    fetcher.state,
    setGlossaries,
    setFilteredGlossaries,
    setNextPage,
    setFilterValue,
  ]);

  const onSearch = useCallback(() => {
    if (searchTerm === '') {
      fetcher.load('/glossary');
      setGlossaries([]);
      setFilterValue('');
    } else {
      fetcher.load(`/glossary?search=${searchTerm?.trim().toLocaleLowerCase()}`);
    }
  }, [searchTerm, fetcher, setGlossaries, setFilterValue]);

  return { onSearch };
};
