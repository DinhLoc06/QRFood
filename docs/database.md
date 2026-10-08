# QRFood Database Design

## Core entities
- users
- tables
- dining_sessions
- categories
- products
- orders
- order_items

## Constraints
- Unique table numbers
- Capacity must be positive
- Each active session references one table
- order item price is stored as numeric

## Example ERD
```mermaid
erDiagram
  TABLES ||--o{ DINING_SESSIONS : hosts
  DINING_SESSIONS ||--o{ ORDERS : contains
  ORDERS ||--o{ ORDER_ITEMS : includes
  CATEGORIES ||--o{ PRODUCTS : groups
  PRODUCTS ||--o{ ORDER_ITEMS : sold_as
```
