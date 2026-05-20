import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [verificationListing, setVerificationListing] = useState(null);
  const [enteredKey, setEnteredKey] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  
  // Counterfeit Report State
  const [reportingListing, setReportingListing] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [photoProof, setPhotoProof] = useState(null);
  const [videoProof, setVideoProof] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await API.get('/seller-listings');
      setListings(response.data);
    } catch (err) {
      console.error('Error fetching marketplace listings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOpen = (listing) => {
    setVerificationListing(listing);
    setEnteredKey('');
    setVerifyResult(null);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!enteredKey) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const response = await API.post(`/seller-listings/${verificationListing.id}/verify`, {
        entered_key: enteredKey
      });
      setVerifyResult(response.data);
    } catch (err) {
      setVerifyResult({
        message: err.response?.data?.message || 'Verification execution failed. Please log in first.',
        verified: false
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleReportOpen = (listing) => {
    setReportingListing(listing);
    setReportReason('');
    setReportSuccess(null);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason || reportReason.length < 10) return;
    setSubmittingReport(true);
    setReportSuccess(null);

    try {
      const formData = new FormData();
      formData.append('listing_id', reportingListing.id);
      formData.append('reason', reportReason);
      if (photoProof) formData.append('photo_proof', photoProof);
      if (videoProof) formData.append('video_proof', videoProof);

      const response = await API.post('/counterfeit-reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReportSuccess(response.data.message);
      // Automatically refresh catalog after report
      fetchListings();
      setPhotoProof(null);
      setVideoProof(null);
    } catch (err) {
      setReportSuccess(err.response?.data?.message || 'Failed to file counterfeit report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const brands = ['All', ...new Set(listings.map(l => l.product?.brand).filter(Boolean))];

  const filteredListings = listings.filter(l => {
    const productName = l.product?.product_name || '';
    const brand = l.product?.brand || '';
    const matchesSearch = productName.toLowerCase().includes(search.toLowerCase()) || 
                          brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="container-fluid">
      
      {/* Visual Welcome Banner */}
      <div className="glass-panel p-5 mb-5 text-center text-lg-start border-secondary position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(10,15,29,0.9) 100%)' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h1 className="display-4 fw-extrabold mb-3">
              Buy Original, <span className="gradient-text">Verify Instantly</span>
            </h1>
            <p className="lead text-secondary mb-4">
              A decentralized credential marketplace solving counterfeit fraud. Admin-approved merchants list authentic merchandise verified through manufacturer security keys.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <span className="badge bg-secondary border border-secondary p-2.5 rounded-3 d-flex align-items-center gap-1.5">
                <i className="bi bi-shield-fill-check text-success"></i> Admin Security Audited
              </span>
              <span className="badge bg-secondary border border-secondary p-2.5 rounded-3 d-flex align-items-center gap-1.5">
                <i className="bi bi-patch-check-fill text-indigo"></i> Merchant Trust Rating
              </span>
              <span className="badge bg-secondary border border-secondary p-2.5 rounded-3 d-flex align-items-center gap-1.5">
                <i className="bi bi-key-fill text-warning"></i> Key Authentication Match
              </span>
            </div>
          </div>
          <div className="col-lg-4 text-center d-none d-lg-block">
            <i className="bi bi-shield-check fs-0 text-indigo opacity-25" style={{ fontSize: '10rem', color: 'var(--accent-primary)' }}></i>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-secondary border-secondary text-secondary">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control form-glass-input" 
              placeholder="Search products, brands, models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 d-flex align-items-center gap-2 justify-content-md-end">
          <span className="text-secondary small fw-bold">BRAND:</span>
          <div className="btn-group flex-wrap">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`btn btn-sm px-3 py-2 ${selectedBrand === b ? 'btn-indigo text-white' : 'btn-outline-secondary'}`}
                style={selectedBrand === b ? { background: 'var(--accent-primary)' } : {}}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary">Connecting to secure verification nodes...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="glass-panel p-5 text-center border-secondary mt-4">
          <i className="bi bi-bag-x fs-1 text-muted"></i>
          <h4 className="mt-3 text-light">No Authentic Products Listed</h4>
          <p className="text-secondary small">No matching verified listings exist. Please adjust your filters or search keywords.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredListings.map(listing => {
            const product = listing.product;
            const seller = listing.seller;
            
            // Calculate hypothetical trust rating based on our algorithm or default high score
            // In a fully built backend, trust scores are aggregated per seller
            const trustRating = seller?.role === 'seller' ? 95 : 100;

            return (
              <div key={listing.id} className="col-md-6 col-lg-4">
                <div className="glass-card h-100 d-flex flex-column justify-content-between p-4">
                  <div>
                    {/* Top badging */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-secondary border border-secondary text-uppercase fw-bold text-secondary-emphasis" style={{ fontSize: '0.75rem' }}>
                        {product?.brand}
                      </span>
                      <span className="badge-original d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-shield-fill-check"></i> ORIGINAL LISTING
                      </span>
                    </div>

                    {/* Product visual details */}
                    <div className="text-center py-3 bg-secondary-subtle rounded-3 mb-3 border border-secondary position-relative" style={{ minHeight: '140px', background: 'rgba(255,255,255,0.02)' }}>
                      {listing.listing_image ? (
                        <img 
                          src={`http://127.0.0.1:8000/${listing.listing_image}`} 
                          alt={product?.product_name}
                          className="img-fluid rounded-2"
                          style={{ maxHeight: '120px', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">
                          <i className="bi bi-image fs-1 opacity-25"></i>
                          <span className="small opacity-50">Image Authenticated</span>
                        </div>
                      )}
                    </div>

                    <h5 className="fw-bold mb-2 text-light">{product?.product_name}</h5>
                    <p className="text-secondary small line-clamp-3 mb-3" style={{ height: '54px', overflow: 'hidden' }}>{product?.description}</p>
                    
                    {/* Price & Merchant details */}
                    <div className="border-top border-secondary pt-3 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small">Seller:</span>
                        <strong className="text-light small d-flex align-items-center gap-1">
                          {seller?.name}
                          <i className="bi bi-patch-check-fill text-indigo" title="Verified Merchant" style={{ color: 'var(--accent-primary)' }}></i>
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">Merchant Trust Rating:</span>
                        <span className="text-success small fw-bold d-flex align-items-center gap-1">
                          <i className="bi bi-shield-heart-fill"></i> High Trust
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Catalog Actions */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="fs-3 fw-bold gradient-text">${parseFloat(listing.price).toFixed(2)}</div>
                      <span className="text-muted small">Price USD</span>
                    </div>

                    <div className="d-grid gap-2">
                      <button 
                        onClick={() => handleVerifyOpen(listing)}
                        className="btn btn-indigo text-white hover-glow d-flex align-items-center justify-content-center gap-2 py-2"
                        data-bs-toggle="modal" 
                        data-bs-target="#verifyModal"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        <i className="bi bi-shield-fill-check"></i>
                        <span>Verify Authenticity</span>
                      </button>

                      {user && user.role === 'user' && (
                        <button 
                          onClick={() => handleReportOpen(listing)}
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1.5"
                          data-bs-toggle="modal" 
                          data-bs-target="#reportModal"
                        >
                          <i className="bi bi-exclamation-triangle"></i>
                          <span>Report Counterfeit</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VERIFICATION ENGINE MODAL --- */}
      <div className="modal fade" id="verifyModal" tabIndex="-1" aria-labelledby="verifyModalLabel" aria-hidden="true" style={{ backdropFilter: 'blur(8px)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-panel border border-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            
            <div className="modal-header border-secondary px-4 pt-4">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="verifyModalLabel">
                <i className="bi bi-shield-lock-fill text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
                <span>Authentication Gateway</span>
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body px-4 pb-4">
              {verificationListing && (
                <>
                  <div className="mb-4 text-center">
                    <h6 className="text-secondary small fw-bold uppercase">PRODUCT UNDER TEST</h6>
                    <h5 className="text-light">{verificationListing.product?.product_name}</h5>
                    <span className="text-muted small">Listed by: {verificationListing.seller?.name}</span>
                  </div>

                  {!verifyResult ? (
                    <form onSubmit={handleVerifySubmit}>
                      <div className="alert alert-secondary border-secondary bg-secondary-subtle p-3 rounded-3 mb-4 text-center small text-secondary">
                        <i className="bi bi-info-circle-fill text-indigo fs-5 mb-2 d-block" style={{ color: 'var(--accent-primary)' }}></i>
                        Enter the unique security registration code printed on your product packaging or invoice to check against original database credentials.
                      </div>

                      <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">SECURITY AUTHENTICATION KEY</label>
                        <input 
                          type="text" 
                          value={enteredKey}
                          onChange={(e) => setEnteredKey(e.target.value)}
                          className="form-control form-glass-input text-center fs-5 fw-bold w-100"
                          placeholder="e.g. APPLE-IP15PM-XYZ890"
                          required
                          autoComplete="off"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={verifying}
                        className="btn btn-indigo w-100 py-2.5 rounded-3 fw-bold text-white hover-glow d-flex align-items-center justify-content-center gap-2"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        {verifying ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Querying Nodes...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-patch-check-fill"></i>
                            <span>Query Verification System</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div>
                      {verifyResult.verified ? (
                        <div className="card border-success-subtle p-4 rounded-3 text-center pulse-success position-relative" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                          <i className="bi bi-shield-fill-check text-success display-2 mb-3"></i>
                          <h4 className="text-success fw-bold">VERIFIED ORIGINAL PRODUCT</h4>
                          <p className="text-secondary small mt-2">
                            {verifyResult.message}
                          </p>
                          <div className="border-top border-secondary pt-3 mt-3">
                            <span className="badge bg-success-subtle border border-success text-success px-3 py-2 rounded-pill small">
                              100% Match Checked
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="card border-danger-subtle p-4 rounded-3 text-center pulse-danger position-relative" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                          <i className="bi bi-shield-fill-x text-danger display-2 mb-3"></i>
                          <h4 className="text-danger fw-bold">DUPLICATE DETECTED</h4>
                          <p className="text-secondary small mt-2">
                            {verifyResult.message}
                          </p>
                          <div className="border-top border-secondary pt-3 mt-3 d-grid gap-2">
                            <span className="badge bg-danger-subtle border border-danger text-danger px-3 py-2 rounded-pill small mb-2">
                              Verification Key Mismatch
                            </span>
                            {user && user.role === 'user' && (
                              <button
                                onClick={() => {
                                  // Close verify modal and open report modal
                                  const verifyModalEl = document.getElementById('verifyModal');
                                  const verifyModalInstance = bootstrap.Modal.getInstance(verifyModalEl);
                                  verifyModalInstance.hide();
                                  handleReportOpen(verificationListing);
                                  // Programmatically trigger report modal display
                                  setTimeout(() => {
                                    const reportModalEl = document.getElementById('reportModal');
                                    const reportModalInstance = new bootstrap.Modal(reportModalEl);
                                    reportModalInstance.show();
                                  }, 400);
                                }}
                                className="btn btn-danger btn-sm"
                                style={{ background: 'var(--danger)' }}
                              >
                                <i className="bi bi-exclamation-triangle-fill"></i> Report Counterfeit Instantly
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => setVerifyResult(null)}
                        className="btn btn-outline-secondary w-100 py-2 mt-4"
                      >
                        Verify Another Key
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
          </div>
        </div>
      </div>

      {/* --- COUNTERFEIT REPORTING MODAL --- */}
      <div className="modal fade" id="reportModal" tabIndex="-1" aria-labelledby="reportModalLabel" aria-hidden="true" style={{ backdropFilter: 'blur(8px)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content glass-panel border border-secondary" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            
            <div className="modal-header border-secondary px-4 pt-4">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2 text-danger" id="reportModalLabel">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>File Counterfeit Complaint</span>
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body px-4 pb-4">
              {reportingListing && (
                <>
                  <div className="mb-3 text-center">
                    <h6 className="text-secondary small fw-bold uppercase">REPORTING LISTING ID: #{reportingListing.id}</h6>
                    <h5 className="text-light">{reportingListing.product?.product_name}</h5>
                    <span className="text-muted small">Offered by: {reportingListing.seller?.name}</span>
                  </div>

                  {!reportSuccess ? (
                    <form onSubmit={handleReportSubmit}>
                      <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">EXPLAIN THE SUSPICIOUS DETAIL (MIN 10 CHARACTERS)</label>
                        <textarea 
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="form-control form-glass-input w-100" 
                          rows="4"
                          placeholder="e.g. The printed key failed verification, the stitching looks cheap, or pricing is unusually cheap for an original product."
                          required
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">PHOTO PROOF (OPTIONAL)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={e => setPhotoProof(e.target.files[0])}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">VIDEO PROOF (OPTIONAL)</label>
                        <input
                          type="file"
                          accept="video/*"
                          className="form-control"
                          onChange={e => setVideoProof(e.target.files[0])}
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={submittingReport || reportReason.length < 10}
                        className="btn btn-danger w-100 py-2.5 rounded-3 fw-bold text-white hover-glow d-flex align-items-center justify-content-center gap-2"
                        style={{ background: 'var(--danger)' }}
                      >
                        {submittingReport ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            <span>Filing Report...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill"></i>
                            <span>Submit Complaint to Admin</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center p-4 rounded-3 border border-secondary" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <i className="bi bi-patch-check-fill text-success display-3 mb-3"></i>
                      <h5 className="text-light fw-bold">Report Processed</h5>
                      <p className="text-secondary small mt-2">
                        {reportSuccess}
                      </p>
                      <button 
                        type="button"
                        className="btn btn-indigo btn-sm mt-3 px-4"
                        data-bs-dismiss="modal"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        Return to Shop
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
};

export default Marketplace;
