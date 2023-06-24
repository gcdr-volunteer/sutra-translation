import { useIntersectionObserver } from '@react-hookz/web';
import { useNavigate } from '@remix-run/react';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import type { Glossary } from '~/types';

export const useGlossary = ({
  glossaries,
  footRef,
  nextPage,
}: {
  glossaries: Glossary[];
  footRef: React.RefObject<HTMLDivElement>;
  nextPage?: string;
}) => {
  const intersection = useIntersectionObserver(footRef, { threshold: [0.0] });
  const [gloss, setGloss] = useState<Glossary[]>([]);
  useEffect(() => {
    if (glossaries?.length) {
      setGloss((prev) => {
        let newglossaries = _.uniqBy([...prev, ...glossaries], (gl) => gl.origin);
        newglossaries = _.sortBy(newglossaries, (o) => o.createdAt).reverse();
        return newglossaries;
      });
    }
  }, [glossaries]);

  const navigate = useNavigate();

  useEffect(() => {
    // navigate to the same path, but without any query parameters
    navigate(window.location.pathname);
  }, [navigate]);

  useEffect(() => {
    if (intersection?.isIntersecting && nextPage) {
      navigate(`/glossary?page=${nextPage}`, { replace: true });
    }
  }, [nextPage, intersection, navigate]);

  return { gloss, isIntersecting: intersection?.isIntersecting };
};
