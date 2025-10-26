import React from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
// We might add routing later if we add the About page back
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import AboutPage from './pages/AboutPage';
import './App.css';

function App() {
  return (
    <Layout>
      <HomePage />
      {/* Basic structure without routing for now */}
      {/* <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Layout>
      </Router> */}
    </Layout>
  );
}

export default App;