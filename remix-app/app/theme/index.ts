import { breakpoints } from './breakpoints';
import { colors } from './colors';
export const customTheme = () => {
  return {
    ...colors,
    ...breakpoints,
  };
};
