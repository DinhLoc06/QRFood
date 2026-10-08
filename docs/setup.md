# Setup Instructions

## Backend
1. Install Java 21 and Maven.
2. Install and start PostgreSQL, then create the `qrfood` database and user.
3. The default connection is `jdbc:postgresql://localhost:5432/qrfood`, with username and password `qrfood`.
4. From the project root, run:
   ```powershell
   cd backend
   mvn test
   mvn spring-boot:run
   ```
5. Flyway's PostgreSQL database module is included so migrations can run against PostgreSQL.

## Frontend
1. cd frontend
2. npm install
3. npm run dev

## Docker
1. Install and start Docker Desktop.
2. From the project root, run:
   ```powershell
   docker compose up --build
   ```
3. Open the frontend at `http://localhost:5173`. The backend is available at `http://localhost:8080`.
4. The Compose PostgreSQL instance is published on host port `5433` to avoid conflicting with a local PostgreSQL service on `5432`. Containers communicate with it on `postgres:5432`.
5. Stop the services with `docker compose down`. Database data is kept in the `qrfood_pgdata` volume.
