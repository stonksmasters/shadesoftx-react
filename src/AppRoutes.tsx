
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ServicesPage from './pages/ServicesPage';
import Home from './pages/Home';
// other imports...

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<ServicesPage />} />

      {/* preserve legacy nav links if your header still links to /residential or /commercial */}
      <Route path="/residential" element={<Navigate to="/services?category=residential" replace />} />
      <Route path="/commercial" element={<Navigate to="/services?category=commercial" replace />} />

      {/* other routes */}
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;