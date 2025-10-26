import React from 'react';
// We'll use Link later when we add routing for the About page
// import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Replace Link with a simple 'a' tag for now */}
        <a href="/">Photo Arranger Pro</a>
      </div>
      {/* We'll add links back later if needed */}
      {/* <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul> */}
    </nav>
  );
}

export default Navbar;