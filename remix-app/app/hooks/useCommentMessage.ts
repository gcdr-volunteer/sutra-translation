import { useContext, useMemo } from 'react';
import { AppContext } from '../routes/__app';
import type { Comment } from '../types';

export const useCommentMessage = (comments: Comment[]) => {
  const { currentUser } = useContext(AppContext);
  const hasNewMessage = useMemo(() => {
    return currentUser?.username !== comments[comments.length - 1]?.creatorAlias;
  }, [currentUser, comments]);

  return { hasNewMessage };
};
