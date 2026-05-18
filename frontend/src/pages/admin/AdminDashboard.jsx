import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Security Administrator Command Center</h2>
        <p className="text-secondary small">Oversee counterfeit verification matching ratios and merchant listing approvals</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
          <p className="mt-2 text-secondary small">Gathering secure metrics...</p>
        </div>
      ) : (
        <>
          {/* Aggregates Grid */}
          <div className="row g-4 mb-5">
            <div className="col-md-3 col-sm-6">
              <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
                <div className="bg-indigo-subtle rounded-3 p-3 text-indigo d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="bi bi-shield-check fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-light">{stats?.total_original_products}</h4>
                  <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>ORIGINAL PRODUCTS</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3 position-relative">
                <div className="bg-warning-subtle rounded-3 p-3 text-warning d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="bi bi-hourglass-split fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-warning">{stats?.pending_listings}</h4>
                  <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>PENDING LISTINGS</span>
                </div>
                {stats?.pending_listings > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {stats.pending_listings}
                  </span>
                )}
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3">
                <div className="bg-success-subtle rounded-3 p-3 text-success d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-success">{stats?.total_sellers}</h4>
                  <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>ACTIVE SELLERS</span>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="glass-panel p-4 border-secondary d-flex align-items-center gap-3 position-relative">
                <div className="bg-danger-subtle rounded-3 p-3 text-danger d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                  <i className="bi bi-exclamation-triangle fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-danger">{stats?.total_reports}</h4>
                  <span className="text-secondary small uppercase fw-bold" style={{ fontSize: '0.65rem' }}>FRAUD COMPLAINTS</span>
                </div>
                {stats?.total_reports > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {stats.total_reports}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Core Audit Ratios */}
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="glass-panel p-5 border-secondary h-100 text-center">
                <i className="bi bi-activity text-indigo fs-1 mb-3" style={{ color: 'var(--accent-primary)' }}></i>
                <h4 className="fw-bold mb-2">Total Verifications Handled</h4>
                <div className="display-3 fw-bold gradient-text my-3">{stats?.total_verifications}</div>
                <p className="text-secondary small px-lg-5">
                  The VeriTrust key validation engine operates 24/7. Consumer authentication checks contribute to merchant rating adjustments.
                </p>
                <div className="d-grid mt-4">
                  <Link to="/admin/logs" className="btn btn-outline-light btn-sm py-2">
                    Review Verification Logs History
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-panel p-5 border-secondary h-100 text-center">
                <i className="bi bi-pie-chart text-indigo fs-1 mb-3" style={{ color: 'var(--accent-primary)' }}></i>
                <h4 className="fw-bold mb-4">System Verification Verdicts</h4>
                
                <div className="d-flex justify-content-around align-items-center py-2">
                  <div>
                    <h2 className="text-success fw-bold mb-1">
                      {stats?.original_matches}
                    </h2>
                    <span className="badge-original small">
                      <i className="bi bi-shield-fill-check"></i> ORIGINAL
                    </span>
                  </div>
                  
                  <div className="vr bg-secondary" style={{ height: '60px' }}></div>
                  
                  <div>
                    <h2 className="text-danger fw-bold mb-1">
                      {stats?.counterfeit_matches}
                    </h2>
                    <span className="badge-duplicate small">
                      <i className="bi bi-shield-fill-x"></i> DUPLICATE
                    </span>
                  </div>
                </div>
                
                <p className="text-secondary small mt-4 px-lg-5">
                  Ratio of original matches vs flagged duplicate counterfeit attempts logged in current epoch.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
