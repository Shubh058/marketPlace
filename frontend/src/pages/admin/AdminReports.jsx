import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const API_ORIGIN = 'http://127.0.0.1:8000';

  const handleRemoveListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to permanently remove this listing?')) return;
    setRemovingId(listingId);
    try {
      await API.delete(`/seller-listings/${listingId}`);
      // Remove all reports for this listing from local state
      setReports(prev => prev.filter(rep => rep.listing?.id !== listingId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove listing.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRejectListing = async (report) => {
    const listingId = report.listing?.id;
    if (!listingId) return;
    if (!window.confirm('Mark this product listing as rejected and close the complaint?')) return;

    setRejectingId(report.id);
    try {
      await API.put(`/seller-listings/${listingId}/status`, { status: 'rejected' });
      await API.put(`/admin/reports/${report.id}/status`, { status: 'resolved' });
      setReports(prev => prev.map(rep =>
        rep.id === report.id
          ? {
              ...rep,
              status: 'resolved',
              listing: rep.listing ? { ...rep.listing, verification_status: 'rejected' } : rep.listing,
            }
          : rep
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject listing.');
    } finally {
      setRejectingId(null);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await API.get('/admin/reports');
      setReports(response.data);
    } catch (err) {
      console.error('Error fetching counterfeit reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await API.put(`/admin/reports/${id}/status`, { status: 'resolved' });
      // Update local state smoothly
      setReports(prev => prev.map(rep => 
        rep.id === id ? { ...rep, status: 'resolved' } : rep
      ));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve report.');
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Counterfeit Fraud Complaints</h2>
        <p className="text-secondary small">Investigate customer-filed reports regarding suspicious duplicate listings and low-trust merchants</p>
      </div>

      <div className="glass-panel p-4 border-secondary">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-danger">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>Fraud Backlog Cases</span>
        </h5>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
            <p className="mt-2 text-secondary small">Gathering counterfeit complaints...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-shield-check fs-2 text-success"></i>
            <h6 className="mt-3 text-light">Complaints Queue Clean</h6>
            <p className="text-secondary small mb-0">No merchant counterfeit reports exist in queue.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-glass">
              <thead>
                <tr>
                  <th scope="col">Case ID</th>
                  <th scope="col">Reporting Customer</th>
                  <th scope="col">Reported Listing Model</th>
                  <th scope="col">Offered By (Seller)</th>
                  <th scope="col" style={{ width: '30%' }}>Consumer Allegations / Reason</th>
                  <th scope="col">Proof</th>
                  <th scope="col">Case Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((rep) => {
                  const listing = rep.listing;
                  const product = listing?.product;
                  const seller = listing?.seller;
                  const customer = rep.user;

                  return (
                    <tr key={rep.id}>
                      <td className="text-danger fw-bold">#CR-{rep.id}</td>
                      <td>
                        <div className="fw-bold text-light">{customer?.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>{customer?.email}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-light">{product?.product_name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Brand: {product?.brand}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-light">{seller?.name}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Trust rating: High</div>
                      </td>
                      <td>
                        <p className="text-secondary small mb-0 lh-base" style={{ whiteSpace: 'normal' }}>
                          "{rep.reason}"
                        </p>
                      </td>
                      <td>
                        <div className="d-grid gap-2">
                          {rep.photo_proof ? (
                            <a
                              href={`${API_ORIGIN}/${rep.photo_proof}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
                            >
                              <i className="bi bi-image-fill text-info"></i>
                              <span>Photo</span>
                            </a>
                          ) : null}
                          {rep.video_proof ? (
                            <a
                              href={`${API_ORIGIN}/${rep.video_proof}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
                            >
                              <i className="bi bi-camera-video-fill text-warning"></i>
                              <span>Video</span>
                            </a>
                          ) : null}
                          {!rep.photo_proof && !rep.video_proof && (
                            <span className="text-muted small">No proof attached</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {rep.status === 'resolved' ? (
                          <span className="badge bg-success-subtle border border-success text-success px-3 py-1.5 rounded-pill fw-bold">
                            <i className="bi bi-check-circle-fill"></i> RESOLVED
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle border border-danger text-danger px-3 py-1.5 rounded-pill fw-bold pulse-danger">
                            <i className="bi bi-exclamation-triangle-fill"></i> PENDING CASE
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {rep.status === 'pending' ? (
                            <>
                              <button
                                disabled={rejectingId === rep.id || resolvingId === rep.id}
                                onClick={() => handleRejectListing(rep)}
                                className="btn btn-warning btn-sm text-dark d-flex align-items-center gap-1.5"
                              >
                                <i className="bi bi-shield-x"></i>
                                <span>{rejectingId === rep.id ? 'Rejecting...' : 'Reject Listing'}</span>
                              </button>
                              <button
                                disabled={resolvingId === rep.id || rejectingId === rep.id}
                                onClick={() => handleResolve(rep.id)}
                                className="btn btn-indigo btn-sm text-white d-flex align-items-center gap-1.5"
                                style={{ background: 'var(--accent-primary)' }}
                              >
                                <i className="bi bi-check-lg"></i>
                                <span>Mark Resolved</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-secondary small">Closed</span>
                          )}
                          <button
                            disabled={removingId === listing?.id}
                            onClick={() => handleRemoveListing(listing?.id)}
                            className="btn btn-danger btn-sm d-flex align-items-center gap-1.5"
                          >
                            <i className="bi bi-trash"></i>
                            <span>{removingId === listing?.id ? 'Removing...' : 'Remove Listing'}</span>
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

export default AdminReports;
