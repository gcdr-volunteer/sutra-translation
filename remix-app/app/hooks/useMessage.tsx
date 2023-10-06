import { useRevalidator } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { useEventSource } from 'remix-utils';
import type { User } from '~/types';

export const useMessage = (currentUser?: User) => {
  const message = useEventSource('/chat/subscribe', { event: 'new-message' });
  const revalidator = useRevalidator();

  useEffect(() => {
    if (message) {
      const msgObj = JSON.parse(message) as { id: string; username: string };
      if (msgObj.username !== currentUser?.username) {
        revalidator.revalidate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
};

export const useGpt = () => {
  const message = useEventSource('/chat/subscribe', { event: 'gpt' });
  const translation = useRef('');

  useEffect(() => {
    if (message) {
      translation.current += message;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return translation.current;
};
