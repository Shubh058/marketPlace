import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const handleBanSeller = async (id) => {
    if (!window.confirm('Are you sure you want to ban this seller?')) return;
    setActioningId(id);
    try {
      await API.put(`/admin/sellers/${id}/ban`);
      setSellers(prev => prev.map(s => s.id === id ? { ...s, status: 'banned' } : s));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to ban seller.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRemoveSeller = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this seller?')) return;
    setActioningId(id);
    try {
      await API.delete(`/admin/sellers/${id}`);
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove seller.');
    } finally {
      setActioningId(null);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await API.get('/admin/sellers');
      setSellers(response.data);
    } catch (err) {
      console.error('Error fetching admin sellers', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Manage Platform Sellers</h2>
        <p className="text-secondary small">Audit merchant trust scores computed by rejected listing credentials and counterfeit logs</p>
      </div>

      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-people text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span>Merchant Trust Directories</span>
        </h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Evaluating seller trust scores...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-person-x fs-2 text-muted"></i>
            <h6 className="mt-3 text-light">No Registered Merchants</h6>
            <p className="text-secondary small mb-0">There are no seller accounts registered on the system yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass">
              <thead>
                <tr>
                  <th scope="col">Merchant ID</th>
                  <th scope="col">Information</th>
                  <th scope="col">Inventory Count</th>
                  <th scope="col">Approved / Rejected</th>
                  <th scope="col">Complaints Count</th>
                  <th scope="col">Merchant Trust Score</th>
                  <th scope="col">Verified Status Badge</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => {
                  return (
                    <tr key={seller.id}>
                      <td className="text-secondary fw-bold">#{seller.id}</td>
                      <td>
                        <div className="fw-bold text-light d-flex align-items-center gap-1.5">
                          {seller.name}
                          {seller.is_verified_seller && (
                            <i className="bi bi-patch-check-fill text-indigo" title="Verified Seller Badge" style={{ color: 'var(--accent-primary)' }}></i>
                          )}
                        </div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{seller.email}</div>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle border border-secondary text-secondary-emphasis px-3 py-1.5 rounded fw-bold">
                          {seller.total_listings} Listings
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2 small">
                          <span className="text-success fw-bold d-flex align-items-center gap-1">
                            <i className="bi bi-check-circle-fill"></i> {seller.approved_listings}
                          </span>
                          <span className="text-muted">/</span>
                          <span className="text-danger fw-bold d-flex align-items-center gap-1">
                            <i className="bi bi-x-circle-fill"></i> {seller.rejected_listings}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`fw-bold d-flex align-items-center gap-1 ${seller.counterfeit_reports_count > 0 ? 'text-danger' : 'text-secondary'}`}>
                          <i className="bi bi-exclamation-triangle"></i> {seller.counterfeit_reports_count} Reports
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1 bg-dark border border-secondary" style={{ height: '8px', minWidth: '70px', borderRadius: '4px' }}>
                            <div 
                              className={`progress-bar rounded ${seller.trust_score >= 80 ? 'bg-success' : seller.trust_score >= 50 ? 'bg-warning' : 'bg-danger'}`} 
                              role="progressbar" 
                              style={{ width: `${seller.trust_score}%` }} 
                              aria-valuenow={seller.trust_score} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span className={`fw-bold small ${seller.trust_score >= 80 ? 'text-success' : seller.trust_score >= 50 ? 'text-warning' : 'text-danger'}`}>
                            {seller.trust_score}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {seller.is_verified_seller ? (
                          <span className="badge bg-indigo-subtle border border-indigo text-indigo px-3 py-1.5 rounded-pill fw-bold" style={{ color: '#818cf8', borderColor: 'var(--accent-primary)' }}>
                            <i className="bi bi-patch-check-fill"></i> VERIFIED BADGE
                          </span>
                        ) : (
                          <span className="badge bg-secondary border border-secondary text-secondary px-3 py-1.5 rounded-pill small">
                            NO BADGE
                          </span>
                        )}
                      </td>
                      <td className="small text-secondary">
                        {new Date(seller.created_at).toLocaleDateString()}
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-warning btn-sm"
                            disabled={actioningId === seller.id || seller.status === 'banned'}
                            onClick={() => handleBanSeller(seller.id)}
                          >
                            {seller.status === 'banned' ? 'Banned' : 'Ban Seller'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actioningId === seller.id}
                            onClick={() => handleRemoveSeller(seller.id)}
                          >
                            Remove Seller
                          </button>
                        </div>
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

export default ManageSellers;
