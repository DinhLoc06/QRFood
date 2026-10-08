# QRFood Architecture

## Backend
- Spring Boot 3.4
- Spring Web, Web Security, JPA
- PostgreSQL
- JWT-based RBAC

## Frontend
- Vite + React + TypeScript
- React Router
- Axios + Zustand
- Tailwind CSS

## Monolith architecture
The application follows a simple monolith with module-based packages: auth, table, session, category, product, order, and qr.

## Flow
Customer -> /start -> /menu -> cart -> order -> staff/kitchen -> close session -> table available.
