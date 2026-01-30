import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AlternativeModeContextType {
  isAlternativeMode: boolean;
  setAlternativeMode: (mode: boolean) => void;
}

const AlternativeModeContext = createContext<AlternativeModeContextType | undefined>(undefined);

export const AlternativeModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAlternativeMode, setIsAlternativeMode] = useState(false);

  const setAlternativeMode = (mode: boolean) => {
    setIsAlternativeMode(mode);
  };

  return (
    <AlternativeModeContext.Provider value={{ isAlternativeMode, setAlternativeMode }}>
      {children}
    </AlternativeModeContext.Provider>
  );
};

export const useAlternativeMode = () => {
  const context = useContext(AlternativeModeContext);
  if (!context) {
    throw new Error('useAlternativeMode must be used within AlternativeModeProvider');
  }
  return context;
};
