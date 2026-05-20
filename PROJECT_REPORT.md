# Counterfeit Product Verification Marketplace
## Project Report

**Prepared by**
- Rohit Singh — 12311093
- Shubham Bhatt — 12311024
- Ramish Raza — 12311216

**Technologies Used**
- Frontend: React.js, HTML5, CSS3, Bootstrap 5, Axios, React Router DOM
- Backend: PHP Laravel 12 MVC, REST API, Laravel Sanctum, Composer
- Database: MySQL with XAMPP

---

## 1. Introduction

The **Counterfeit Product Verification Marketplace** is a full-stack, role-based web application designed to help customers identify whether a product is original or duplicate. In many online marketplaces, the same product is sold by multiple sellers, which makes it difficult for buyers to trust what they receive. This project addresses that problem by introducing **admin-approved product credentials**, **seller listings**, **product verification**, and **counterfeit reporting**.

The system separates users into three roles: **Admin**, **Seller/Merchant**, and **User/Customer**. Each role has its own dashboard and permissions. The Admin registers original products and approves seller listings. The Seller lists products using the provided authentication key. The User browses products, verifies authenticity, and reports suspicious or counterfeit items.

---

## 2. Problem Statement

Online marketplaces often contain multiple listings for the same product. Some sellers may sell genuine items, while others may offer duplicate or counterfeit products. Buyers usually cannot verify authenticity before purchasing. This creates a trust issue and increases the risk of fraud.

This project solves that problem by creating a marketplace where:
- original products are registered by the Admin,
- sellers can list products only against approved product records,
- users can verify authenticity using a product key,
- counterfeit products can be reported for review.

---

## 3. Project Objective

The main objective of this project is to build a secure and user-friendly marketplace system where:
- Admins manage original products and seller approvals,
- Sellers submit listings with product details and invoice proof,
- Users verify products through authentication keys,
- Duplicate or counterfeit products are detected and reported.

---

## 4. Scope of the System

The system is a web-based marketplace with the following features:
- role-based login and registration,
- product management by Admin,
- seller listing submission,
- listing approval and rejection,
- user product verification,
- counterfeit complaint submission,
- verification logs and reports,
- dashboard views for each role.

The project is built as a modular system so that future features such as notification emails, payment integration, or advanced fraud scoring can be added later.

---

## 5. Roles and Responsibilities

### 5.1 Admin
The Admin has full control over the system.
Responsibilities:
- log in to the admin dashboard,
- add original products,
- generate and manage authentication keys,
- upload official product images,
- approve or reject seller listings,
- view verification logs,
- manage sellers,
- review counterfeit complaints.

### 5.2 Seller / Merchant
The Seller lists products for sale.
Responsibilities:
- register and log in,
- access seller dashboard,
- submit product listings,
- upload invoice or proof documents,
- enter product authentication key,
- view listing approval status,
- manage own listings only.

### 5.3 User / Customer
The User verifies products and reports fraud.
Responsibilities:
- register and log in,
- browse marketplace listings,
- compare products from multiple sellers,
- verify product originality,
- report counterfeit products,
- view verification history.

---

## 6. Technology Stack

### Frontend
- **React.js** for reusable UI components and page routing
- **Bootstrap 5** for responsive styling and ecommerce UI
- **Axios** for API communication
- **React Router DOM** for page navigation

### Backend
- **Laravel 12 MVC** for backend structure and business logic
- **REST APIs** for frontend-backend communication
- **Laravel Sanctum** for token-based authentication
- **Composer** for package management

### Database
- **MySQL** using **XAMPP** for local development and relational data storage

---

## 7. System Workflow

The main verification flow works as follows:

1. Admin adds an original product with a unique authentication key.
2. Seller selects the product and submits a listing with the seller key, invoice proof, and price.
3. The listing is stored in the database and sent for admin review.
4. Admin approves or rejects the listing.
5. Approved listings appear on the marketplace.
6. User opens a listing and enters the product key for verification.
7. The backend checks the entered key against the original key stored in the database.
8. If the key matches, the system returns **Original Product**.
9. If the key does not match, the system returns **Duplicate / Counterfeit Product**.
10. If needed, the user can submit a counterfeit report with proof.

---

## 8. Main Functional Modules

### 8.1 Authentication Module
- user registration,
- role-based login,
- Sanctum token authentication,
- protected API routes,
- logout functionality.

### 8.2 Product Management Module
- add original products,
- store product name, brand, category, description, and original key,
- upload official product image.

### 8.3 Seller Listing Module
- create product listings,
- upload invoice files and listing images,
- store seller authentication key and price,
- view listing status.

### 8.4 Verification Module
- accept a key from the user,
- compare it with the original key in the database,
- save verification result in the log table.

### 8.5 Counterfeit Reporting Module
- submit counterfeit complaints,
- upload photo or video proof,
- prevent duplicate reports by the same user.

### 8.6 Admin Dashboard Module
- manage products,
- approve or reject listings,
- manage sellers,
- view reports and verification logs.

---

## 9. Database Design

The system uses a relational MySQL database. The main tables are:

### 9.1 `users`
Stores all users and their roles.
- id
- name
- email
- password
- role

### 9.2 `products`
Stores original product records created by the Admin.
- id
- product_name
- brand
- category
- description
- original_auth_key
- official_image

### 9.3 `seller_listings`
Stores product listings submitted by sellers.
- id
- seller_id
- product_id
- seller_auth_key
- invoice_file
- listing_image
- verification_status
- price

### 9.4 `verification_logs`
Stores authenticity check history.
- id
- user_id
- listing_id
- entered_key
- result

### 9.5 `counterfeit_reports`
Stores counterfeit complaints submitted by users.
- id
- user_id
- listing_id
- reason
- status

---

## 10. Backend Architecture

The backend follows Laravel MVC and REST API architecture.

### Controllers
- `AuthController`
- `AdminController`
- `ProductController`
- `SellerListingController`
- `VerificationController`
- `ReportController`

### Middleware
- `AdminMiddleware`
- `SellerMiddleware`
- `UserMiddleware`

### Important Backend Features
- validation of all incoming requests,
- role protection for routes,
- file upload handling,
- Eloquent relationships between models,
- clean API responses,
- seed data for testing.

---

## 11. Frontend Architecture

The frontend is built in React with a component-based structure.

### Main Pages
- Login
- Register
- Admin Dashboard
- Add Original Product
- Manage Listings
- Seller Dashboard
- Add Listing
- User Marketplace
- Product Verification Page
- Verification Result Page
- Reports Page

### UI Design
The user interface follows a modern ecommerce style with:
- responsive Bootstrap cards,
- navbar and sidebar layouts,
- verification badges,
- green and red result alerts,
- seller trust display,
- verified seller indicators.

---

## 12. Verification Logic

The system verifies products using the following rule:

- If `seller_auth_key == original_auth_key`, the product is marked as **Original**.
- Otherwise, the product is marked as **Duplicate / Counterfeit**.

This logic is stored in the backend so that every verification is recorded and traceable.

---

## 13. Implementation Status

The following parts have been implemented in the project:
- Laravel backend setup with Sanctum authentication,
- MySQL database setup using XAMPP,
- role-based API routes,
- seller listing workflow,
- admin product creation workflow,
- product authenticity verification,
- counterfeit reporting,
- seeded demo accounts and sample records,
- React frontend pages for auth, seller, user, and admin modules.

---

## 14. Testing Summary

The project was tested for:
- database connection,
- user login,
- seller listing submission,
- admin approval flow,
- verification result generation,
- counterfeit report storage,
- role-based access control.

The seeded demo users are:
- Admin: `admin@example.com` / `password123`
- Seller: `seller1@example.com` / `password123`
- User: `user@example.com` / `password123`

---

## 15. Conclusion

The **Counterfeit Product Verification Marketplace** provides a practical solution for detecting duplicate and counterfeit products in an online marketplace environment. By combining role-based authentication, admin-approved product records, seller listings, and user verification, the system improves trust and transparency.

The project demonstrates a complete full-stack implementation using **React**, **Laravel 12**, **MySQL**, **XAMPP**, and **Sanctum**. It is modular, secure, and suitable for academic submission as well as future enhancement.

---

## 16. Team Members

- **Rohit Singh** — 12311093
- **Shubham Bhatt** — 12311024
- **Ramish Raza** — 12311216

---

## 17. Repository and References

- GitHub Repository: 
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev/
- MySQL Documentation: https://dev.mysql.com/doc/
- Bootstrap Documentation: https://getbootstrap.com/docs/
