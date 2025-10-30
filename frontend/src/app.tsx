import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import LoginPage from './screens/loginPage';
import TestStartPage from '../src/screens/playTest';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestStartPage />} />
      </Routes>
    </Router>
  );
};

export default App;
