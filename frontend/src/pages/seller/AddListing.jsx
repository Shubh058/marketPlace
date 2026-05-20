import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AddListing = () => {
  const [products, setProducts] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sellerAuthKey, setSellerAuthKey] = useState('');
  const [price, setPrice] = useState('');
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [listingImage, setListingImage] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOriginalProducts();
  }, []);

  useEffect(() => {
    if (!products.length) {
      return;
    }

    const uniqueBrands = Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort();

    if (!selectedBrand && uniqueBrands.length > 0) {
      setSelectedBrand(uniqueBrands[0]);
    }
  }, [products, selectedBrand]);

  useEffect(() => {
    if (!selectedBrand || !products.length) {
      setSelectedCategory('');
      return;
    }

    const uniqueCategories = Array.from(
      new Set(
        products
          .filter((product) => product.brand === selectedBrand)
          .map((product) => product.category)
          .filter(Boolean)
      )
    ).sort();

    if (!uniqueCategories.length) {
      setSelectedCategory('');
      return;
    }

    if (!selectedCategory || !uniqueCategories.includes(selectedCategory)) {
      setSelectedCategory(uniqueCategories[0]);
    }
  }, [products, selectedBrand, selectedCategory]);

  useEffect(() => {
    if (!selectedBrand || !selectedCategory) {
      setSelectedProductId('');
      return;
    }

    const matchingProducts = products.filter(
      (product) => product.brand === selectedBrand && product.category === selectedCategory
    );

    if (!matchingProducts.length) {
      setSelectedProductId('');
      return;
    }

    if (!matchingProducts.some((product) => String(product.id) === String(selectedProductId))) {
      setSelectedProductId(String(matchingProducts[0].id));
    }
  }, [products, selectedBrand, selectedCategory, selectedProductId]);

  const fetchOriginalProducts = async () => {
    try {
      const response = await API.get('/products');
      setProducts(response.data);
      if (response.data.length > 0) {
        setSelectedProductId(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching original products', err);
      setErrorMsg('Failed to load registered original products catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInvoiceChange = (e) => {
    setInvoiceFile(e.target.files[0]);
  };

  const handleImageChange = (e) => {
    setListingImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedProductId) {
      setErrorMsg('Please select a valid brand, category, and product model.');
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

    // Build multi-part form data since we are transmitting files
    const formData = new FormData();
    formData.append('product_id', selectedProductId);
    formData.append('seller_auth_key', sellerAuthKey);
    formData.append('price', price);
    formData.append('invoice_file', invoiceFile);
    if (listingImage) {
      formData.append('listing_image', listingImage);
    }

    try {
      await API.post('/seller-listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg('Product listing registered and submitted to administration for credentials verification!');
      
      // Navigate back to seller dashboard after short delay
      setTimeout(() => {
        navigate('/seller');
      }, 2000);

    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join(' ');
        setErrorMsg(errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to submit product listing. Verify file sizes.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid">
      
      {/* Title Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Register Product Listing</h2>
        <p className="text-secondary small">Provide invoice proofs and manufacturer security keys to prove product authenticity</p>
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

            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="spinner-border text-indigo" role="status" style={{ color: 'var(--accent-primary)' }}></div>
                <p className="mt-2 text-secondary small">Fetching database original models...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="alert alert-warning border-warning-subtle bg-warning-subtle text-warning p-4 rounded-3 text-center">
                <i className="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                <h5 className="fw-bold">No Base Products Registered</h5>
                <p className="small mb-0">The administrator must register original manufacturer products before you can add items.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} encType="multipart/form-data">

                {/* Brand Select */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">SELECT BRAND</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="form-select form-glass-input form-glass-select w-100"
                    required
                  >
                    {Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort().map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">SELECT CATEGORY</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-select form-glass-input form-glass-select w-100"
                    required
                    disabled={!selectedBrand}
                  >
                    {Array.from(
                      new Set(
                        products
                          .filter((product) => product.brand === selectedBrand)
                          .map((product) => product.category)
                          .filter(Boolean)
                      )
                    ).sort().map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Product Model Select */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">SELECT PRODUCT MODEL</label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="form-select form-glass-input form-glass-select w-100"
                    required
                    disabled={!selectedCategory}
                  >
                    {products
                      .filter((product) => product.brand === selectedBrand && product.category === selectedCategory)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_name}
                        </option>
                      ))}
                  </select>
                  {selectedBrand && selectedCategory && (
                    <div className="form-text text-muted small mt-1">
                      Selected brand: {selectedBrand} | category: {selectedCategory}
                    </div>
                  )}
                </div>

                {/* Seller Auth Key */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">MANUFACTURER SECURITY KEY (MANUAL INSERT)</label>
                  <input 
                    type="text" 
                    value={sellerAuthKey}
                    onChange={(e) => setSellerAuthKey(e.target.value)}
                    className="form-control form-glass-input w-100" 
                    placeholder="e.g. APPLE-IP15PM-XYZ890"
                    required
                  />
                  <div className="form-text text-muted small mt-1">
                    Enter the code printed on the official product box. Admin will inspect if this matches the original manufacturer's credentials.
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">LISTING OFFER PRICE (INR ₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-secondary text-secondary fw-bold">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="form-control form-glass-input w-100" 
                      placeholder="e.g. 10999.00"
                      required
                    />
                  </div>
                  <div className="form-text text-muted small mt-1">
                    Store the price in Indian Rupees. The backend keeps it as a numeric value.
                  </div>
                </div>

                {/* Invoice File Upload */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">PROOF OF PURCHASE / INVOICE FILE</label>
                  <input 
                    type="file" 
                    onChange={handleInvoiceChange}
                    className="form-control form-glass-input w-100" 
                    accept=".pdf,.png,.jpg,.jpeg"
                    required
                  />
                  <div className="form-text text-muted small mt-1">
                    Upload official purchase invoice to prove your merchant source. PDF and standard images accepted (Max 2MB).
                  </div>
                </div>

                {/* Actual Product Photo */}
                <div className="mb-4">
                  <label className="form-label text-secondary small fw-bold">ACTUAL PRODUCT PHOTO (OPTIONAL)</label>
                  <input 
                    type="file" 
                    onChange={handleImageChange}
                    className="form-control form-glass-input w-100" 
                    accept="image/*"
                  />
                  <div className="form-text text-muted small mt-1">
                    Upload a high-quality picture of the merchandise under test.
                  </div>
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
                        <span>Registering Listing...</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill"></i>
                        <span>Register Listing & Submit Invoice</span>
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/seller')}
                    className="btn btn-outline-secondary px-4"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export default AddListing;
