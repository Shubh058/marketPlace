import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top px-3" style={{ height: '70px', background: 'var(--bg-secondary) !important' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <i className="bi bi-shield-lock-fill fs-3 text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span className="fw-bold tracking-tight">
            Veri<span className="text-indigo" style={{ color: 'var(--accent-primary)' }}>Trust</span>
          </span>
          <span className="badge bg-secondary border border-dark fs-8">Marketplace</span>
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarText">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-light opacity-75 hover-opacity-100" to="/">Marketplace</Link>
            </li>
          </ul>
          
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary small">Logged in as:</span>
                  <span className="badge bg-indigo-subtle border border-indigo text-indigo px-3 py-2 rounded-pill d-flex align-items-center gap-1" style={{ color: '#818cf8', borderColor: 'var(--accent-primary)' }}>
                    <i className="bi bi-person-fill"></i>
                    <strong className="text-capitalize">{user.name} ({user.role})</strong>
                  </span>
                </div>
                
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/user'} 
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 px-3"
                >
                  <i className="bi bi-speedometer2"></i>
                  Dashboard
                </Link>

                <button 
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm d-flex align-items-center gap-1 px-3"
                  style={{ background: 'var(--danger)' }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">Login</Link>
                <Link to="/register" className="btn btn-indigo btn-sm px-3 text-white" style={{ background: 'var(--accent-primary)' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
