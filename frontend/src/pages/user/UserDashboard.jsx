import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">My Verification Dashboard</h2>
        <p className="text-secondary small">Review your safety audit score and purchase check history</p>
      </div>

      {/* Aggregate Score Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-indigo-subtle rounded-3 p-3 text-indigo d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="bi bi-shield-check fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-light">{totalChecks}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>TOTAL CODES SEARCHED</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-success-subtle rounded-3 p-3 text-success d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="bi bi-patch-check-fill fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-success">{originalMatches}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>AUTHENTIC MATCHES</span>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
            <div className="bg-danger-subtle rounded-3 p-3 text-danger d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <i className="bi bi-shield-fill-x fs-2"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-danger">{counterfeitMatches}</h3>
              <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.75rem' }}>COUNTERFEITS DETECTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification History Table */}
      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span>Verification Audit Trail</span>
        </h5>

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
            <table className="table table-dark table-glass">
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
