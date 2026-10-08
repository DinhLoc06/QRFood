# Architecture Decisions

- Use a monolithic Spring Boot service to keep implementation simple and production-friendly.
- Use the smallest suitable available table as the default assignment rule.
- Use optimistic but database-level locking via PESSIMISTIC_WRITE on table selection to protect against duplicate assignment.
- Keep product and order values in the backend to preserve business accuracy.
