import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { DataProvider } from '../context/DataContext';
import { AlternativeModeProvider, useAlternativeMode } from '../context/AlternativeModeContext';
import { Layout } from './Layout';
import { Home } from '../pages/Home';
import { Sessions } from '../pages/Sessions';
import { ShameWall } from '../pages/ShameWall';
import { Rankings } from '../pages/Rankings';
import { Achievements } from '../pages/Achievements';
import { DailyMovies } from '../pages/DailyMovies';
import { Statistics } from '../pages/Statistics';
import { Backup } from '../pages/Backup';
import { StartSession } from '../pages/StartSession';

export const App: React.FC = () => {
  return (
    <DataProvider>
      <AlternativeModeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AlternativeModeProvider>
    </DataProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAlternativeMode } = useAlternativeMode();
  const location = useLocation();
  
  // Só mostra "LucasFlix Alternativo" na página de iniciar sessão
  const isStartSessionPage = location.pathname === '/start-session';
  const brandTitle = (isStartSessionPage && isAlternativeMode) ? 'LucasFlix Alternativo' : 'LucasFlix';

  return (
    <Layout brandTitle={brandTitle}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/start-session" element={<StartSession />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/shame-wall" element={<ShameWall />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/daily-movies" element={<DailyMovies />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/backup" element={<Backup />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};
