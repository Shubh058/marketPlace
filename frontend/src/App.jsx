import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer / Public Pages
import Marketplace from './pages/user/Marketplace';
import UserDashboard from './pages/user/UserDashboard';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import AddListing from './pages/seller/AddListing';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageListings from './pages/admin/ManageListings';
import ManageSellers from './pages/admin/ManageSellers';
import AdminReports from './pages/admin/AdminReports';
import VerificationLogs from './pages/admin/VerificationLogs';

// CSS Imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

// Protected Route Wrapper (Ensures user is logged in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
        <p className="mt-3 text-secondary small">Authenticating credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role-Based Route Wrapper (Restricts route by role)
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
        <p className="mt-3 text-secondary small">Verifying authorization clearance...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        
        {/* --- Public Auth Access --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Hybrid Marketplace / Storefront (Accessible to All) --- */}
        <Route path="/" element={
          <Layout>
            <Marketplace />
          </Layout>
        } />

        {/* --- Customer (User) Protected Routes --- */}
        <Route path="/user" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['user']}>
              <Layout>
                <UserDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* --- Seller Protected Routes --- */}
        <Route path="/seller" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['seller']}>
              <Layout>
                <SellerDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/seller/add-listing" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['seller']}>
              <Layout>
                <AddListing />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        {/* Seller manufacturer product creation removed per product flow changes */}

        {/* --- Admin Protected Routes --- */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        {/* Admin product creation moved to seller panel; admin manages listings and approvals only. */}
        <Route path="/admin/listings" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Layout>
                <ManageListings />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/sellers" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Layout>
                <ManageSellers />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Layout>
                <AdminReports />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <Layout>
                <VerificationLogs />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        } />

        {/* Fallback Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
