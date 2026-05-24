import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Sidebar = () => {
  const { user } = useAuth();
  const [addressDraft, setAddressDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showContactPanel, setShowContactPanel] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'user') return;

    const addressKey = `veritrust_address_${user.id}`;
    const phoneKey = `veritrust_phone_${user.id}`;
    setAddressDraft(localStorage.getItem(addressKey) || '');
    setPhoneDraft(localStorage.getItem(phoneKey) || '');
    setSaveStatus('');
    setShowContactPanel(false);
  }, [user]);

  const handleSaveAddress = (e) => {
    e.preventDefault();

    if (!user || user.role !== 'user') return;

    if (!addressDraft.trim()) {
      setSaveStatus('Please enter a delivery address.');
      return;
    }

    if (!phoneDraft.trim()) {
      setSaveStatus('Please enter a phone number.');
      return;
    }

    const addressKey = `veritrust_address_${user.id}`;
    const phoneKey = `veritrust_phone_${user.id}`;
    localStorage.setItem(addressKey, addressDraft.trim());
    localStorage.setItem(phoneKey, phoneDraft.trim());
    setSaveStatus('Delivery address and phone saved.');
    setShowContactPanel(false);
    window.dispatchEvent(new CustomEvent('veritrust-address-updated'));
  };

  if (!user) return null;
  const renderAdminLinks = () => (
    <>
      <div className="text-muted small uppercase fw-bold mb-3 px-3">ADMIN COMMAND</div>
      <NavLink to="/admin" end className="nav-link">
        <i className="bi bi-speedometer2"></i>
        <span>Stats Overview</span>
      </NavLink>
      {/* Admin no longer creates original products here; sellers register manufacturer products. */}
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

      <div className="mt-3 mx-3 rounded-4 border border-secondary overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <button
          type="button"
          onClick={() => setShowContactPanel((current) => !current)}
          className="w-100 d-flex align-items-center justify-content-between px-3 py-3 border-0 text-start"
          style={{ background: 'transparent', color: 'inherit' }}
        >
          <div>
            <div className="small fw-bold text-light">Delivery Address</div>
            <div className="text-secondary" style={{ fontSize: '0.78rem' }}>
              Click to add address and phone
            </div>
          </div>
          <i className={`bi ${showContactPanel ? 'bi-chevron-up' : 'bi-chevron-down'} text-indigo`} style={{ color: 'var(--accent-primary)' }}></i>
        </button>

        {showContactPanel && (
          <div className="px-3 pb-3 pt-0">
            <form onSubmit={handleSaveAddress} className="d-grid gap-2">
              <textarea
                value={addressDraft}
                onChange={(e) => setAddressDraft(e.target.value)}
                className="form-control form-glass-input"
                rows="4"
                placeholder="House no, street, city, state, pincode"
                style={{ resize: 'none' }}
              />
              <input
                type="tel"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                className="form-control form-glass-input"
                placeholder="Phone number"
              />
              <button type="submit" className="btn btn-sm btn-indigo text-white" style={{ background: 'var(--accent-primary)' }}>
                Save Address
              </button>
            </form>
            <div className="text-secondary small mt-2" style={{ lineHeight: '1.4' }}>
              Saved address is used for the delivered-order view on the storefront.
            </div>
            {saveStatus && (
              <div className="small mt-2 fw-bold" style={{ color: saveStatus.includes('saved') ? '#34d399' : '#fbbf24' }}>
                {saveStatus}
              </div>
            )}
          </div>
        )}
      </div>
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
