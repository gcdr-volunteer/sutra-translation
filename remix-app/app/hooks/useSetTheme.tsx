import { useEffect, useState } from 'react';
export const useSetTheme = () => {
  const [fontSize, setFontSize] = useState('');
  const [fontFamilyOrigin, setFontFamilyOrigin] = useState('');
  const [fontFamilyTarget, setFontFamilyTarget] = useState('');

  useEffect(() => {
    const fontSize = localStorage.getItem('fontSize');
    const fontFamilyOrigin = localStorage.getItem('fontFamilyOrigin');
    const fontFamilyTarget = localStorage.getItem('fontFamilyTarget');
    if (fontSize) {
      setFontSize(fontSize);
    } else {
      setFontSize('lg');
    }
    if (fontFamilyOrigin) {
      setFontFamilyOrigin(fontFamilyOrigin);
    } else {
      setFontFamilyOrigin('PingFang SC');
    }
    if (fontFamilyTarget) {
      setFontFamilyTarget(fontFamilyTarget);
    } else {
      setFontFamilyTarget('SF NS');
    }
  }, []);

  useEffect(() => {
    if (fontSize) {
      localStorage.setItem('fontSize', fontSize);
    }
    if (fontFamilyOrigin) {
      localStorage.setItem('fontFamilyOrigin', fontFamilyOrigin);
    }
    if (fontFamilyTarget) {
      localStorage.setItem('fontFamilyTarget', fontFamilyTarget);
    }
  }, [fontSize, fontFamilyOrigin, fontFamilyTarget]);

  return {
    fontSize,
    fontFamilyOrigin,
    fontFamilyTarget,
    setFontSize,
    setFontFamilyOrigin,
    setFontFamilyTarget,
  };
};
