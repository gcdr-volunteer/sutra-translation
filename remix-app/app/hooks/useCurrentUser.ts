import { useContext } from 'react';
import { AppContext } from '../routes/__app';

export const useCurrentUser = () => {
  const { currentUser } = useContext(AppContext);
  return { currentUser };
};
