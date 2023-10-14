import { useEffect, useState } from 'react';
import { useKeyPress } from './useKeyPress';

export const useSearchResultsNavigator = (resultlength: number) => {
  const arrowUpPressed = useKeyPress('ArrowUp');
  const arrowDownPressed = useKeyPress('ArrowDown');
  const [focusIndex, setFocusIndex] = useState<number>(-1);

  useEffect(() => {
    if (arrowUpPressed) {
      if (focusIndex > 0) {
        setFocusIndex((pre) => pre - 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      if (focusIndex < resultlength - 1) {
        setFocusIndex((pre) => pre + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrowDownPressed]);
  return { focusIndex, setFocusIndex };
};
