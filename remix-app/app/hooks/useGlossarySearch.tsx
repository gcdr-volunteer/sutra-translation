import { useNavigate } from '@remix-run/react';
import { useCallback, useState } from 'react';

export const useGlossarySearch = () => {
  const [input, setInput] = useState('');

  const navigate = useNavigate();
  const handleGlossarySearch = useCallback(() => {
    navigate(`/glossary?search=${input}`, { replace: true });
    setInput('');
  }, [navigate, input]);

  return { input, setInput, handleGlossarySearch };
};
