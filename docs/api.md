# QRFood API Summary

## Auth
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

Demo accounts: `admin/admin123`, `staff/staff123`, and `kitchen/kitchen123`.

## Tables
- GET /api/tables
- GET /api/tables/available
- POST /api/tables

## Sessions
- POST /api/sessions
- GET /api/sessions/{id}
- GET /api/payments/session/{sessionId}
- POST /api/payments
- GET /api/payments (ADMIN, STAFF)
- POST /api/payments/{id}/confirm (ADMIN, STAFF)

## Products
- GET /api/products
- GET /api/products/{id}
- POST /api/products
- PUT /api/products/{id}

## Orders
- POST /api/orders
- GET /api/orders
- GET /api/orders/{id}
- PUT /api/orders/{id}/confirm
- PUT /api/orders/{id}/reject
- PUT /api/orders/{id}/status

## Categories
- GET /api/categories
- POST /api/categories (ADMIN)
- PUT /api/categories/{id} (ADMIN)

## Users
- GET /api/users (ADMIN)
- POST /api/users (ADMIN)
