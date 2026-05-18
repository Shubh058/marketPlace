import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Global Navbar Header */}
      <Navbar />
      
      {/* Main Core Container */}
      <div className="container-fluid flex-grow-1 p-0">
        <div className="row g-0 m-0">
          
          {/* Sticky Left Sidebar Menu */}
          <div className="col-lg-3 col-xl-2 p-0 d-none d-lg-block">
            <Sidebar />
          </div>
          
          {/* Dynamic Content Panel */}
          <div className="col-lg-9 col-xl-10 p-4">
            <main className="h-100">
              {children}
            </main>
          </div>
          
        </div>
      </div>
      
      {/* Elegant Mini Footer */}
      <footer className="bg-dark text-muted text-center py-3 border-top border-secondary mt-auto" style={{ background: 'var(--bg-secondary) !important', fontSize: '0.9rem' }}>
        <div className="container">
          <span>&copy; {new Date().getFullYear()} VeriTrust Counterfeit Protection Marketplace. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
