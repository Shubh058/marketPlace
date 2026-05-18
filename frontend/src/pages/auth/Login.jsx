import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, error: authError, setError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'seller') navigate('/seller');
      else navigate('/');
    }
  }, [user, navigate]);

  // Clean up error state on mount
  useEffect(() => {
    setError(null);
    setLocalError('');
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'seller') navigate('/seller');
      else navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid login details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="row justify-content-center w-100">
        <div className="col-md-6 col-lg-5">
          <div className="glass-panel p-5 border border-secondary hover-glow">
            
            {/* Header Title */}
            <div className="text-center mb-4">
              <i className="bi bi-shield-lock-fill fs-1 text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
              <h2 className="mt-3 fw-bold">Sign In to <span className="gradient-text">VeriTrust</span></h2>
              <p className="text-secondary small">Counterfeit Product Verification Portal</p>
            </div>

            {/* Display Error Message */}
            {(localError || authError) && (
              <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger p-3 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                <div className="small">{localError || authError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">PASSWORD</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  placeholder="Enter secure password"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-indigo w-100 py-2.5 rounded-3 fw-bold text-white hover-glow mb-3 d-flex align-items-center justify-content-center gap-2"
                style={{ background: 'var(--accent-primary)' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/register" className="text-indigo small fw-bold text-decoration-none" style={{ color: '#818cf8' }}>
                Create Account
              </Link>
            </div>

            <div className="border-top border-secondary mt-4 pt-3 text-center">
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                Demo Credentials:
                <br />
                <code className="text-indigo">admin@example.com / password123</code> (Admin)
                <br />
                <code className="text-indigo">seller1@example.com / password123</code> (Seller)
                <br />
                <code className="text-indigo">user@example.com / password123</code> (User)
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
