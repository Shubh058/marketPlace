import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await API.get('/seller-listings');
      setListings(response.data);
    } catch (err) {
      console.error('Error fetching admin listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActioningId(id);
    try {
      await API.put(`/seller-listings/${id}/status`, { status });
      // Update local state smoothly
      setListings(prev => prev.map(item => 
        item.id === id ? { ...item, verification_status: status } : item
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update listing status.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Review Merchant Listings</h2>
        <p className="text-secondary small">Compare merchant-submitted keys against master security codes to filter duplicate fraud</p>
      </div>

      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-ui-checks text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
          <span>Credential Verification Backlog</span>
        </h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Synchronizing credential list...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-file-earmark-check fs-2 text-muted"></i>
            <h6 className="mt-3 text-light">Audit Backlog Empty</h6>
            <p className="text-secondary small mb-0">No merchant product listings exist in backlog.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Seller / Merchant</th>
                  <th scope="col">Product Model</th>
                  <th scope="col">Key comparison</th>
                  <th scope="col">Invoice document</th>
                  <th scope="col">Verification Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((list) => {
                  const product = list.product;
                  const seller = list.seller;
                  
                  // Verification key matching logic
                  const keysMatch = list.seller_auth_key === product?.original_auth_key;

                  return (
                    <tr key={list.id}>
                      <td className="text-secondary fw-bold">#{list.id}</td>
                      <td>
                        <div className="fw-bold text-light">{seller?.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{seller?.email}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-light">{product?.product_name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Brand: {product?.brand}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <div>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Seller: </span>
                            <code className="text-indigo bg-dark border border-secondary px-1.5 py-0.5 rounded">{list.seller_auth_key}</code>
                          </div>
                          <div>
                            <span className="text-secondary" style={{ fontSize: '0.75rem' }}>Admin: </span>
                            <code className="text-success bg-dark border border-secondary px-1.5 py-0.5 rounded">{product?.original_auth_key}</code>
                          </div>
                          <div className="mt-1">
                            {keysMatch ? (
                              <span className="badge bg-success-subtle border border-success text-success px-2 py-0.5 rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-shield-fill-check"></i> KEY MATCHED (VALID)
                              </span>
                            ) : (
                              <span className="badge bg-danger-subtle border border-danger text-danger px-2 py-0.5 rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-shield-fill-x"></i> MISMATCH (DUPLICATE)
                              </span>
                            )}
                          </div>
                        </div>
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
                            <i className="bi bi-patch-check-fill"></i> APPROVED
                          </span>
                        )}
                        {list.verification_status === 'pending' && (
                          <span className="badge-pending">PENDING AUDIT</span>
                        )}
                        {list.verification_status === 'rejected' && (
                          <span className="badge-duplicate">REJECTED</span>
                        )}
                      </td>
                      <td className="text-end">
                        {list.verification_status === 'pending' ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              disabled={actioningId === list.id}
                              onClick={() => handleStatusUpdate(list.id, 'approved')}
                              className="btn btn-success btn-sm d-flex align-items-center gap-1"
                              style={{ background: 'var(--success)' }}
                            >
                              <i className="bi bi-check2"></i> Approve
                            </button>
                            <button
                              disabled={actioningId === list.id}
                              onClick={() => handleStatusUpdate(list.id, 'rejected')}
                              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                              style={{ background: 'var(--danger)' }}
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-secondary small">Decided</span>
                        )}
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

export default ManageListings;
