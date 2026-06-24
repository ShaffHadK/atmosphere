import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingScreen from './pages/LandingScreen';
import MainWeatherScreen from './pages/MainWeatherScreen';
import SavedForecastScreen from './pages/SavedForecastScreen';
import { NotificationProvider } from './components/Notification';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/weather/:city" element={<MainWeatherScreen />} />
          <Route path="/saved/:id" element={<SavedForecastScreen />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
