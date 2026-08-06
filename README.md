# Pay-Sphere — Modern Fintech Platform

> Production-quality fintech web application for payments, transfers, and financial management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Query, React Hook Form, Zod, Axios, Recharts, Framer Motion |
| **Backend** | Java 21, Spring Boot 3.3, Spring Security, JWT, Spring Data JPA, Hibernate, Maven, PostgreSQL, Flyway, Swagger/OpenAPI |
| **Realtime** | WebSocket, STOMP |
| **Storage** | PostgreSQL 16, Redis 7 |
| **AI Service** | Python FastAPI, scikit-learn, Sentence Transformers |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- Docker & Docker Compose
- Maven 3.9+

### 1. Start Infrastructure

```bash
cd docker
docker compose up -d
```

This starts PostgreSQL (port 5432), Redis (port 6379), and pgAdmin (port 5050).

### 2. Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs at `http://localhost:8080`. Swagger UI at `http://localhost:8080/swagger-ui.html`.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Project Structure

```
pay-sphere/
├── backend/                   # Spring Boot API
│   ├── src/main/java/com/paysphere/
│   │   ├── config/            # App configuration
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── entity/            # JPA entities
│   │   ├── enums/             # Enumerations
│   │   ├── exception/         # Exception handling
│   │   ├── mapper/            # Entity-DTO mappers
│   │   ├── repository/        # JPA repositories
│   │   ├── security/          # JWT & Spring Security
│   │   ├── service/           # Business logic interfaces
│   │   └── util/              # Utility classes
│   └── src/main/resources/
│       ├── db/migration/      # Flyway SQL migrations
│       ├── application.yml    # Main config
│       └── application-dev.yml # Dev profile
├── frontend/                  # React SPA
│   └── src/
│       ├── components/        # UI components
│       │   ├── ui/            # shadcn primitives
│       │   ├── layout/        # Sidebar, Navbar
│       │   └── shared/        # Logo, ThemeToggle
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom hooks
│       ├── layouts/           # Auth & Dashboard layouts
│       ├── lib/               # Axios, utils
│       ├── pages/             # Route pages
│       ├── routes/            # Router config
│       └── types/             # TypeScript types
├── docker/
│   └── docker-compose.yml     # Infrastructure services
├── .env.example               # Environment template
└── README.md
```

---

## API Endpoints (Phase 1)

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/health` | Health check | No |
| GET | `/swagger-ui.html` | API Documentation | No |
| GET | `/actuator/health` | Actuator health | No |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

See `.env.example` for all available variables.

---

## License

MIT
