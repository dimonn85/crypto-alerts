import { FC } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation/Navigation';
import { MonitorPage } from './pages/MonitorPage/MonitorPage';
import { AlertsPage } from './pages/AlertsPage/AlertsPage';
import { useWebSocket } from './hooks/useWebSocket';
import { AlertsProvider } from "./context/AlertProvider.tsx";

const API_KEY = import.meta.env.VITE_API_KEY || '';
const TOPIC = import.meta.env.VITE_TOPIC || '8~Binance~BTC~USDT';
const MAX_ITEMS = import.meta.env.VITE_MAX_ITEMS || 500;

export const App: FC = () => {
  const { isConnected, orders, startStream, stopStream } = useWebSocket({
    apiKey: API_KEY,
    maxItems: MAX_ITEMS,
    topic: TOPIC,
  });

  const handleToggleStream = () => {
    if (isConnected) {
      stopStream();
    } else {
      startStream();
    }
  };

  return (
    <Router>
      <AlertsProvider orders={orders}>
        <Navigation streamStarted={isConnected} onToggleStream={handleToggleStream} />
        <Routes>
          <Route path="/monitor" element={<MonitorPage orders={orders} />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="*" element={<Navigate to="/monitor" replace />} />
        </Routes>
      </AlertsProvider>
    </Router>
  );
};
