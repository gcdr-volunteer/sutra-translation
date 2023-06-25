import { useEffect, useState } from 'react';

export const useModalErrors = <T>({ modalErrors, isOpen }: { modalErrors: T; isOpen: boolean }) => {
  const [errors, setErrors] = useState<T | undefined>(undefined);
  useEffect(() => {
    if (!isOpen) {
      setErrors(undefined);
    }
  }, [isOpen]);

  useEffect(() => {
    setErrors(modalErrors);
  }, [modalErrors]);
  return { errors };
};
