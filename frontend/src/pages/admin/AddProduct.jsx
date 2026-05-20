import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AddProduct = () => {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [originalAuthKey, setOriginalAuthKey] = useState('');
  const [officialImage, setOfficialImage] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setOfficialImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('brand', brand);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('original_auth_key', originalAuthKey);
    if (officialImage) {
      formData.append('official_image', officialImage);
    }

    try {
      await API.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Manufacturer Original Product registered successfully in VeriTrust master database!');
      
      // Reset form
      setProductName('');
      setBrand('');
      setCategory('');
      setDescription('');
      setOriginalAuthKey('');
      setOfficialImage(null);

      // Redirect back to Admin Dashboard after short delay
      setTimeout(() => {
        navigate('/admin');
      }, 1500);

    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(' ');
        setErrorMsg(errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to register product.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Add Original Product Model</h2>
        <p className="text-secondary small">Register base original manufacturer inventory models and corresponding verification matching keys</p>
      </div>

      <div className="row">
        <div className="col-lg-8 col-xl-7">
          <div className="glass-panel p-5 border-secondary">
            
            {/* Display Messages */}
            {errorMsg && (
              <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger p-3 rounded-3 mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-octagon-fill fs-5"></i>
                <div className="small">{errorMsg}</div>
              </div>
            )}
            
            {successMsg && (
              <div className="alert alert-success border-success-subtle bg-success-subtle text-success p-3 rounded-3 mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-patch-check-fill fs-5"></i>
                <div className="small">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-secondary small fw-bold">PRODUCT BRAND NAME</label>
                  <input 
                    type="text" 
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="form-control form-glass-input w-100" 
                    placeholder="e.g. Apple"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">PRODUCT CATEGORY</label>
                  <input 
                    type="text" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-control form-glass-input w-100" 
                    placeholder="e.g. Shoes"
                    required
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-secondary small fw-bold">PRODUCT MODEL NAME</label>
                  <input 
                    type="text" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="form-control form-glass-input w-100" 
                    placeholder="e.g. iPhone 15 Pro Max"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">PRODUCT DETAILED SPECIFICATIONS / DESCRIPTION</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control form-glass-input w-100" 
                  rows="4"
                  placeholder="Enter specifications, authentic hallmarks, and manufacturer details..."
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">OFFICIAL MANUFACTURER AUTHENTICATION KEY</label>
                <input 
                  type="text" 
                  value={originalAuthKey}
                  onChange={(e) => setOriginalAuthKey(e.target.value)}
                  className="form-control form-glass-input w-100 text-uppercase" 
                  placeholder="e.g. APPLE-IP15PM-XYZ890"
                  required
                />
                <div className="form-text text-muted small mt-1">
                  This key constitutes the master record. All seller-submitted keys and customer scans will be evaluated against this value.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">OFFICIAL REPRESENTATIVE PHOTO (OPTIONAL)</label>
                <input 
                  type="file" 
                  onChange={handleImageChange}
                  className="form-control form-glass-input w-100" 
                  accept="image/*"
                />
              </div>

              {/* Actions */}
              <div className="d-flex gap-3 mt-5">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-indigo flex-grow-1 py-2.5 rounded-3 fw-bold text-white hover-glow d-flex align-items-center justify-content-center gap-2"
                  style={{ background: 'var(--accent-primary)' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Saving to Nodes...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-fill-plus"></i>
                      <span>Register Original Product Model</span>
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn btn-outline-secondary px-4"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>

    </div>
  );
};

export default AddProduct;
