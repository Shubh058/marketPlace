import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('user'); // Default to Customer
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user, error: authError, setError } = useAuth();
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

    if (password !== passwordConfirmation) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const registeredUser = await register(name, email, password, passwordConfirmation, role);
      if (registeredUser.role === 'admin') navigate('/admin');
      else if (registeredUser.role === 'seller') navigate('/seller');
      else navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="row justify-content-center w-100">
        <div className="col-md-6 col-lg-5">
          <div className="glass-panel p-5 border border-secondary hover-glow">
            
            {/* Header Title */}
            <div className="text-center mb-4">
              <i className="bi bi-person-plus-fill fs-1 text-indigo" style={{ color: 'var(--accent-primary)' }}></i>
              <h2 className="mt-3 fw-bold">Create Account</h2>
              <p className="text-secondary small">Register on VeriTrust Verification Platform</p>
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
              <div className="mb-3">
                <label className="form-label text-secondary small fw-bold">FULL NAME</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="mb-3">
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

              <div className="mb-3">
                <label className="form-label text-secondary small fw-bold">ACCOUNT ROLE</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-select form-glass-input form-glass-select w-100"
                  required
                >
                  <option value="user">Customer (Verify Authenticity)</option>
                  <option value="seller">Seller / Merchant (List Products)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-bold">PASSWORD</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">CONFIRM PASSWORD</label>
                <input 
                  type="password" 
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  placeholder="Repeat your password"
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check-fill"></i>
                    <span>Register</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-indigo small fw-bold text-decoration-none" style={{ color: '#818cf8' }}>
                Sign In
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
