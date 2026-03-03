import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({ forcedDark: true });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);
  return (
    <ThemeContext.Provider value={{ forcedDark: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
