import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AddListing = () => {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [sellerAuthKey, setSellerAuthKey] = useState('');
  const [price, setPrice] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [listingImage, setListingImage] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products', err);
        setErrorMsg('Failed to load registered products list.');
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    setProductId(selectedId);
    if (selectedId) {
      const selectedProduct = products.find(p => p.id === parseInt(selectedId));
      if (selectedProduct) {
        setProductName(selectedProduct.product_name);
        setBrand(selectedProduct.brand);
        setCategory(selectedProduct.category);
        setDescription(selectedProduct.description);
      }
    } else {
      setProductName('');
      setBrand('');
      setCategory('');
      setDescription('');
    }
  };

  const handleInvoiceChange = (e) => setInvoiceFile(e.target.files[0]);
  const handleImageChange = (e) => setListingImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!productId || !sellerAuthKey) {
      setErrorMsg('Please select a product and enter the manufacturer security key.');
      return;
    }
    if (!invoiceFile) {
      setErrorMsg('Please upload a merchant invoice document (PDF or Image).');
      return;
    }
    if (parseFloat(price) <= 0 || isNaN(parseFloat(price))) {
      setErrorMsg('Please enter a valid price greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('seller_auth_key', sellerAuthKey);
    formData.append('price', price);
    formData.append('invoice_file', invoiceFile);
    if (listingImage) formData.append('listing_image', listingImage);

    try {
      await API.post('/seller-listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccessMsg('Product listing registered and submitted to administration for verification!');
      setTimeout(() => navigate('/seller'), 1500);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(' ');
        setErrorMsg(errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to submit product listing.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="fw-bold">Submit Product for Approval</h2>
        <p className="text-secondary small">Select a registered product and submit your unique listing credentials for verification.</p>
      </div>

      <div className="row">
        <div className="col-lg-8 col-xl-7">
          <div className="glass-panel p-5 border-secondary">
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

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">SELECT PRODUCT MODEL</label>
                <select
                  value={productId}
                  onChange={handleProductChange}
                  className="form-select form-glass-input w-100"
                  required
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.product_name} ({p.brand})
                    </option>
                  ))}
                </select>
                {products.length === 0 && (
                  <div className="form-text text-warning small mt-1">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    No products registered by Admin yet. Please register products as Admin first.
                  </div>
                )}
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label text-secondary small fw-bold">BRAND / MANUFACTURER</label>
                  <input
                    type="text"
                    value={brand}
                    className="form-control form-glass-input w-100"
                    placeholder="Auto-populated"
                    disabled
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small fw-bold">CATEGORY</label>
                  <input
                    type="text"
                    value={category}
                    className="form-control form-glass-input w-100"
                    placeholder="Auto-populated"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">PRODUCT DESCRIPTION</label>
                <textarea
                  value={description}
                  className="form-control form-glass-input w-100"
                  rows="4"
                  placeholder="Auto-populated"
                  disabled
                  readOnly
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">MANUFACTURER SECURITY KEY</label>
                <input
                  type="text"
                  value={sellerAuthKey}
                  onChange={(e) => setSellerAuthKey(e.target.value.toUpperCase())}
                  className="form-control form-glass-input w-100 text-uppercase"
                  placeholder="e.g. APPLE-IP15PM-XYZ890"
                  required
                />
                <div className="form-text text-muted small mt-1">Submit the verification key for your product listing. Admin will verify this against their records.</div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">PROOF OF PURCHASE / INVOICE FILE</label>
                <input type="file" onChange={handleInvoiceChange} className="form-control form-glass-input w-100" accept=".pdf,.png,.jpg,.jpeg" required />
                <div className="form-text text-muted small mt-1">Upload official purchase invoice to prove your merchant source. PDF and standard images accepted (Max 2MB).</div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">ACTUAL PRODUCT PHOTO (OPTIONAL)</label>
                <input type="file" onChange={handleImageChange} className="form-control form-glass-input w-100" accept="image/*" />
                <div className="form-text text-muted small mt-1">Upload a high-quality picture of the merchandise under test.</div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">LISTING OFFER PRICE (INR ₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-secondary border-secondary text-secondary fw-bold">₹</span>
                  <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="form-control form-glass-input w-100" placeholder="e.g. 10999.00" required />
                </div>
                <div className="form-text text-muted small mt-1">Store the price in Indian Rupees. The backend keeps it as a numeric value.</div>
              </div>

              <div className="d-flex gap-3 mt-5">
                <button type="submit" disabled={isSubmitting} className="btn btn-indigo flex-grow-1 py-2.5 rounded-3 fw-bold text-white hover-glow d-flex align-items-center justify-content-center gap-2" style={{ background: 'var(--accent-primary)' }}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Submitting Listing...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </button>
                <button type="button" onClick={() => navigate('/seller')} className="btn btn-outline-secondary px-4">Cancel</button>
              </div>

            </form>

          </div>
        </div>
      </div>

    </div>
  );
};

export default AddListing;
