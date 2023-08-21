import { useNavigation } from '@remix-run/react';

export const useTransitionState = () => {
  const navigation = useNavigation();
  return {
    isLoading: navigation.state === 'loading',
    isSubmitting: navigation.state === 'submitting',
    isIdle: navigation.state === 'idle',
  };
};
