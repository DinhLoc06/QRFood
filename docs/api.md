# QRFood API Summary

## Auth
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

## Tables
- GET /api/tables
- GET /api/tables/available
- POST /api/tables

## Sessions
- POST /api/sessions
- GET /api/sessions/{id}
- POST /api/sessions/{id}/close

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
