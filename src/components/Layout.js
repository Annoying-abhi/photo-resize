import React from 'react';
import Navbar from './Navbar';
import '../App.css'; // Use App.css for layout styles

function Layout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      {/* We could add a Footer component here later */}
    </div>
  );
}

export default Layout;