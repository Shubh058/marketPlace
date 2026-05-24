import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await API.get('/verification-history');
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching verification history logs', err);
    } finally {
      setLoading(false);
    }
  };

  const totalChecks = logs.length;
  const originalMatches = logs.filter(l => l.result === 'original').length;
  const counterfeitMatches = logs.filter(l => l.result === 'duplicate').length;
  const trustScore = totalChecks === 0 ? 100 : Math.max(35, 100 - counterfeitMatches * 18);

  return (
    <div className="container-fluid user-dashboard-shell">
      <div className="user-hero glass-panel p-4 p-lg-5 mb-4 mb-lg-5 overflow-hidden position-relative">
        <div className="row align-items-center g-4 position-relative">
          <div className="col-lg-7">
            <div className="user-hero-badge mb-3 d-inline-flex align-items-center gap-2">
              <i className="bi bi-person-badge-fill"></i>
              <span>Customer Account</span>
            </div>
            <div className="hero-copy-panel p-4 p-lg-5 mb-4">
              <h2 className="display-5 fw-bold mb-3 user-hero-title">Hello, {user?.name || 'Customer'}</h2>
              <p className="lead user-hero-subtitle mb-0" style={{ maxWidth: '760px' }}>
                Track authenticity checks, review counterfeit activity, and keep your marketplace profile ready for verified purchases.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <Link to="/" className="btn btn-sm user-hero-button px-3 py-2 rounded-pill fw-bold">
                <i className="bi bi-shop me-1"></i>
                Browse Marketplace
              </Link>
              <span className="user-hero-note d-inline-flex align-items-center gap-2">
                <i className="bi bi-shield-fill-check"></i>
                Verified customer access is active
              </span>
            </div>
          </div>

        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="user-stat-card user-stat-total glass-panel p-4 border-secondary d-flex align-items-center gap-3 h-100">
            <div className="user-stat-icon user-stat-icon-total d-flex align-items-center justify-content-center">
              <i className="bi bi-shield-check fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-light">{totalChecks}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>TOTAL CODES SEARCHED</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="user-stat-card user-stat-safe glass-panel p-4 border-secondary d-flex align-items-center gap-3 h-100">
            <div className="user-stat-icon user-stat-icon-safe d-flex align-items-center justify-content-center">
              <i className="bi bi-patch-check-fill fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-success">{originalMatches}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>AUTHENTIC MATCHES</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="user-stat-card user-stat-alert glass-panel p-4 border-secondary d-flex align-items-center gap-3 h-100">
            <div className="user-stat-icon user-stat-icon-alert d-flex align-items-center justify-content-center">
              <i className="bi bi-shield-fill-x fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-danger">{counterfeitMatches}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>COUNTERFEITS DETECTED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel user-history-panel p-4 border-secondary">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
              <span>Verification Audit Trail</span>
            </h5>
            <p className="text-secondary small mb-0">Your checks are logged here with original or counterfeit results.</p>
          </div>
          <div className="user-history-chip">
            <i className="bi bi-lightning-charge-fill"></i>
            Active account overview
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Syncing audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt-cutoff fs-2 text-muted"></i>
            <h6 className="mt-3 text-light">No Verifications Performed Yet</h6>
            <p className="text-secondary small mb-0">Browse original products in the marketplace and use security keys to test them.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-glass user-history-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Product Information</th>
                  <th scope="col">Seller / Merchant</th>
                  <th scope="col">Key Entered</th>
                  <th scope="col">Verification Verdict</th>
                  <th scope="col">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const product = log.listing?.product;
                  const seller = log.listing?.seller;
                  
                  return (
                    <tr key={log.id}>
                      <td className="text-secondary fw-bold">#{log.id}</td>
                      <td>
                        <div className="fw-bold text-light">{product?.product_name || 'Deleted Product'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Brand: {product?.brand}</div>
                      </td>
                      <td>
                        <span className="text-light small">{seller?.name || 'Unknown Seller'}</span>
                      </td>
                      <td>
                        <code className="text-indigo bg-dark border border-secondary px-2.5 py-1 rounded" style={{ color: '#818cf8' }}>
                          {log.entered_key}
                        </code>
                      </td>
                      <td>
                        {log.result === 'original' ? (
                          <span className="badge-original">
                            <i className="bi bi-shield-fill-check"></i> ORIGINAL
                          </span>
                        ) : (
                          <span className="badge-duplicate">
                            <i className="bi bi-shield-fill-x"></i> DUPLICATE
                          </span>
                        )}
                      </td>
                      <td className="small text-secondary">
                        {new Date(log.created_at).toLocaleString()}
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

export default UserDashboard;
