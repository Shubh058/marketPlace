import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const VerificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await API.get('/admin/verification-logs');
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching admin verification logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Global Verification Audits</h2>
        <p className="text-secondary small">Real-time surveillance of user security scan queries and matching algorithms</p>
      </div>

      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-receipt text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span>Global Audit Records</span>
        </h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Reconstructing audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt-cutoff fs-2 text-muted"></i>
            <h6 className="mt-3 text-light">No Logs Generated Yet</h6>
            <p className="text-secondary small mb-0">No verification checks have been run by users yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass">
              <thead>
                <tr>
                  <th scope="col">Log ID</th>
                  <th scope="col">Audited Buyer</th>
                  <th scope="col">Reported Merchant</th>
                  <th scope="col">Product Information</th>
                  <th scope="col">Key Tested</th>
                  <th scope="col">Match Verdict</th>
                  <th scope="col">Execution Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const product = log.listing?.product;
                  const seller = log.listing?.seller;
                  const user = log.user;

                  return (
                    <tr key={log.id}>
                      <td className="text-secondary fw-bold">#LOG-{log.id}</td>
                      <td>
                        <div className="fw-bold text-light">{user?.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{user?.email}</div>
                      </td>
                      <td>
                        <span className="text-light small">{seller?.name}</span>
                      </td>
                      <td>
                        <div className="fw-bold text-light">{product?.product_name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Brand: {product?.brand}</div>
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

export default VerificationLogs;
