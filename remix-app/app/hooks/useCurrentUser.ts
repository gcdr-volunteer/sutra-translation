import { useContext } from 'react';
import { AppContext } from '../routes/_app';

export const useCurrentUser = () => {
  const { currentUser } = useContext(AppContext);
  return { currentUser };
};
