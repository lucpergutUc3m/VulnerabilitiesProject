import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import LoginPage from './screens/loginPage';
import TestStartPage from '../src/screens/playTest';
import TestScreen from '../src/screens/testScreen';
import TestResults from '../src/screens/testResults';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test/:testId" element={<TestStartPage />} />
        <Route path="/test/:testId/questions" element={<TestScreen />} />
        <Route path="/test/:testId/results" element={<TestResults />} />
      </Routes>
    </Router>
  );
};

export default App;
