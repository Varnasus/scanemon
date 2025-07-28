import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import CollectionPage from './pages/CollectionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModerationPage from './pages/ModerationPage';

function App() {
  return (
    <Router>
      <div className="App min-h-screen">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App; 