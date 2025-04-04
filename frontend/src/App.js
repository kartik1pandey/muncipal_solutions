import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SubmitPage from './pages/SubmitPage';
import SummaryPage from './pages/SummaryPage';
import MunicipalChatbot from './pages/MunicipalChatbot';


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SubmitPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/municipal-chatbot" element={<MunicipalChatbot />} />
      </Routes>
    </Router>
  );
}