# QRFood Requirements

## Functional requirements
- Customer can scan a shared QR code and input number of seated guests.
- Backend selects the smallest available table matching capacity.
- System creates a dining session and displays the menu.
- Customer can add items to cart and create an order.
- Staff can confirm or reject the order.
- Kitchen can update order status to preparing and ready.
- Staff can serve the order and complete the session.
- Table returns to AVAILABLE after session close.

## Non-functional requirements
- REST API with validation and consistent error responses.
- JWT-based authentication for staff, kitchen, and admin.
- PostgreSQL-compatible schema with transaction safeguards.
- Mobile-first customer flow and desktop-friendly staff dashboards.

## Business rules
- One table cannot host two active sessions.
- Customers may only order while the session is ACTIVE.
- Unavailable products are blocked.
- Order item prices are stored at order time.
- Order lifecycle cannot skip states.

## Acceptance criteria
- A four-person group receives the smallest suitable table.
- No table is assigned twice in concurrent requests.
- Order statuses move through the allowed lifecycle.
- Table becomes AVAILABLE only after the session is closed and orders are complete.
