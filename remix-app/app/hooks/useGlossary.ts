import { useIntersectionObserver } from '@react-hookz/web';
import { useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import type { Glossary } from '~/types';
import { Intent } from '~/types/common';

export const useGlossary = ({
  glossaries,
  footRef,
  nextPage,
  intent,
}: {
  glossaries: Glossary[];
  footRef: React.RefObject<HTMLDivElement>;
  nextPage?: string;
  intent: Intent;
}) => {
  const intersection = useIntersectionObserver(footRef, { threshold: [0.0] });
  const [gloss, setGloss] = useState<Glossary[]>([]);
  useEffect(() => {
    if (intent === Intent.SEARCH_GLOSSARY) {
      setGloss(glossaries);
    } else {
      setGloss((prev) => {
        let newglossaries = _.uniqBy([...prev, ...glossaries], (gl) => gl.origin);
        newglossaries = _.sortBy(newglossaries, (o) => o.createdAt).reverse();
        return newglossaries;
      });
    }
  }, [glossaries, nextPage, intent]);

  const navigate = useNavigate();

  useEffect(() => {
    // navigate to the same path, but without any query parameters
    navigate(window.location.pathname);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (intersection?.isIntersecting && nextPage) {
      navigate(`/glossary?page=${nextPage}`, { replace: true });
    }
  }, [nextPage, intersection, navigate]);

  return { gloss, isIntersecting: intersection?.isIntersecting };
};
