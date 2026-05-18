import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const renderAdminLinks = () => (
    <>
      <div className="text-muted small uppercase fw-bold mb-3 px-3">ADMIN COMMAND</div>
      <NavLink to="/admin" end className="nav-link">
        <i className="bi bi-speedometer2"></i>
        <span>Stats Overview</span>
      </NavLink>
      <NavLink to="/admin/add-product" className="nav-link">
        <i className="bi bi-plus-circle"></i>
        <span>Add Original Product</span>
      </NavLink>
      <NavLink to="/admin/listings" className="nav-link">
        <i className="bi bi-ui-checks"></i>
        <span>Manage Listings</span>
      </NavLink>
      <NavLink to="/admin/sellers" className="nav-link">
        <i className="bi bi-people"></i>
        <span>Seller Management</span>
      </NavLink>
      <NavLink to="/admin/reports" className="nav-link">
        <i className="bi bi-exclamation-triangle"></i>
        <span>Counterfeit Reports</span>
      </NavLink>
      <NavLink to="/admin/logs" className="nav-link">
        <i className="bi bi-receipt"></i>
        <span>Verification Logs</span>
      </NavLink>
    </>
  );

  const renderSellerLinks = () => (
    <>
      <div className="text-muted small uppercase fw-bold mb-3 px-3">MERCHANT COMMAND</div>
      <NavLink to="/seller" end className="nav-link">
        <i className="bi bi-grid-1x2"></i>
        <span>Seller Dashboard</span>
      </NavLink>
      <NavLink to="/seller/add-listing" className="nav-link">
        <i className="bi bi-cloud-arrow-up"></i>
        <span>Add Product Listing</span>
      </NavLink>
    </>
  );

  const renderUserLinks = () => (
    <>
      <div className="text-muted small uppercase fw-bold mb-3 px-3">CUSTOMER ACTIONS</div>
      <NavLink to="/" end className="nav-link">
        <i className="bi bi-shop"></i>
        <span>Marketplace Home</span>
      </NavLink>
      <NavLink to="/user" end className="nav-link">
        <i className="bi bi-clock-history"></i>
        <span>My Verifications</span>
      </NavLink>
    </>
  );

  return (
    <div className="sidebar-nav d-none d-lg-block">
      <div className="d-flex flex-column h-100 justify-content-between">
        <div className="nav flex-column nav-pills">
          {user.role === 'admin' && renderAdminLinks()}
          {user.role === 'seller' && renderSellerLinks()}
          {user.role === 'user' && renderUserLinks()}
        </div>
        
        <div className="px-3 py-2 border-top border-secondary mt-auto">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-indigo-subtle rounded-circle p-2 text-indigo d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <div className="small fw-bold">{user.name}</div>
              <div className="small text-muted text-capitalize">{user.role} Portal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
