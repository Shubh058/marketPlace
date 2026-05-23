import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const SellerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await API.get('/my-listings');
      setListings(response.data);
    } catch (err) {
      console.error('Error fetching seller listings', err);
    } finally {
      setLoading(false);
    }
  };

  const totalListings = listings.length;
  const approvedListings = listings.filter(l => l.verification_status === 'approved').length;
  const pendingListings = listings.filter(l => l.verification_status === 'pending').length;
  const rejectedListings = listings.filter(l => l.verification_status === 'rejected').length;

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 g-3">
        <div>
          <h2 className="fw-bold">Merchant Control Dashboard</h2>
          <p className="text-secondary small">Register invoices and security keys to list original merchandise</p>
        </div>
        <Link 
          to="/seller/add-listing" 
          className="btn btn-indigo text-white hover-glow d-flex align-items-center gap-2 px-4 py-2"
          style={{ background: 'var(--accent-primary)' }}
        >
          <i className="bi bi-cloud-arrow-up"></i>
          <span>Create New Product Listing</span>
        </Link>
      </div>

      {/* Aggregate Score Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-sm-6">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-indigo-subtle rounded-3 p-3 text-indigo d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="bi bi-box-seam fs-3"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-light">{totalListings}</h4>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>TOTAL LISTINGS</span>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-success-subtle rounded-3 p-3 text-success d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="bi bi-check-circle fs-3"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-success">{approvedListings}</h4>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>APPROVED LIVE</span>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-warning-subtle rounded-3 p-3 text-warning d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="bi bi-hourglass-split fs-3"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-warning">{pendingListings}</h4>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>PENDING REVIEW</span>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-danger-subtle rounded-3 p-3 text-danger d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <i className="bi bi-x-circle fs-3"></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-danger">{rejectedListings}</h4>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>REJECTED KEYS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Catalog */}
      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-collection-fill text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span>My Product Catalog</span>
        </h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Synchronizing merchant items...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inboxes-fill fs-2 text-muted"></i>
            <h6 className="mt-3 text-light">No Inventory Listed</h6>
            <p className="text-secondary small mb-3">Begin listing items by submitting auth keys and invoices for verification.</p>
            <Link to="/seller/add-listing" className="btn btn-indigo btn-sm px-4" style={{ background: 'var(--accent-primary)' }}>
              Add First Listing
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass">
              <thead>
                <tr>
                  <th scope="col">Listing ID</th>
                  <th scope="col">Product Model</th>
                  <th scope="col">Price</th>
                  <th scope="col">Security Key Supplied</th>
                  <th scope="col">Invoice Document</th>
                  <th scope="col">Verification Status</th>
                  <th scope="col">Registered On</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((list) => {
                  const product = list.product;
                  const displayName = product?.product_name || list.product_name;
                  const displayBrand = product?.brand || list.brand;
                  return (
                    <tr key={list.id}>
                      <td className="text-secondary fw-bold">#{list.id}</td>
                      <td>
                        <div className="fw-bold text-light">{displayName || 'Pending Product'}</div>
                        <div className="text-secondary small">Brand: {displayBrand || 'Pending'}</div>
                      </td>
                      <td className="fw-bold text-indigo" style={{ color: '#818cf8' }}>
                        ${parseFloat(list.price).toFixed(2)}
                      </td>
                      <td>
                        <code className="text-indigo bg-dark border border-secondary px-2.5 py-1 rounded" style={{ color: '#818cf8' }}>
                          {list.seller_auth_key}
                        </code>
                      </td>
                      <td>
                        {list.invoice_file ? (
                          <a 
                            href={`http://127.0.0.1:8000/${list.invoice_file}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline-secondary btn-sm py-1 px-2.5 d-inline-flex align-items-center gap-1.5"
                          >
                            <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                            <span>View Invoice</span>
                          </a>
                        ) : (
                          <span className="text-muted small">No File</span>
                        )}
                      </td>
                      <td>
                        {list.verification_status === 'approved' && (
                          <span className="badge-original">
                            <i className="bi bi-patch-check-fill"></i> APPROVED & LIVE
                          </span>
                        )}
                        {list.verification_status === 'pending' && (
                          <span className="badge-pending d-inline-flex align-items-center gap-1">
                            <span className="spinner-border spinner-border-sm" style={{ width: '0.8rem', height: '0.8rem' }} role="status"></span>
                            PENDING AUDIT
                          </span>
                        )}
                        {list.verification_status === 'rejected' && (
                          <span className="badge-duplicate">
                            <i className="bi bi-x-circle-fill"></i> REJECTED INVALID
                          </span>
                        )}
                      </td>
                      <td className="small text-secondary">
                        {new Date(list.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerDashboard;
