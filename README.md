# Pay-Sphere — Modern Fintech Platform

> Production-quality fintech web application for payments, transfers, and financial management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, React Query, React Hook Form, Zod, Axios, Recharts, Framer Motion |
| **Backend** | Java 21, Spring Boot 3.3, Spring Security, JWT, Spring Data JPA, Hibernate, Spring Scheduler, Maven, PostgreSQL, Flyway, Swagger/OpenAPI |
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

## API Endpoints

### Infrastructure
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/health` | Health check | No |
| GET | `/swagger-ui.html` | API Documentation | No |
| GET | `/actuator/health` | Actuator health | No |

### Authentication
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh token | No |
| POST | `/api/v1/auth/logout` | Logout (blacklist) | Yes |

### Digital Wallet
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/wallet` | Get wallet | Yes |
| POST | `/api/v1/wallet/deposit` | Deposit money | Yes |
| POST | `/api/v1/wallet/withdraw` | Withdraw money | Yes |
| PATCH | `/api/v1/wallet/freeze` | Freeze wallet | Yes |
| PATCH | `/api/v1/wallet/unfreeze` | Unfreeze wallet | Yes |
| GET | `/api/v1/wallet/transactions` | Wallet transactions | Yes |
| GET | `/api/v1/wallet/dashboard` | Wallet dashboard data | Yes |
| GET | `/api/v1/wallet/statement` | Monthly statement | Yes |

### P2P Transfers
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/transfers` | Send money (P2P) | Yes |
| GET | `/api/v1/transfers` | List transfers | Yes |
| GET | `/api/v1/transfers/{id}` | Transfer details | Yes |
| GET | `/api/v1/transfers/search` | Search transfers | Yes |
| GET | `/api/v1/transfers/summary` | Monthly summary | Yes |

### Beneficiaries
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/beneficiaries` | Add beneficiary | Yes |
| GET | `/api/v1/beneficiaries` | List beneficiaries | Yes |
| GET | `/api/v1/beneficiaries/favorites` | Favorite beneficiaries | Yes |
| PATCH | `/api/v1/beneficiaries/{id}/favorite` | Toggle favorite | Yes |
| DELETE | `/api/v1/beneficiaries/{id}` | Delete beneficiary | Yes |

### Users
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/users/me` | Get current user profile | Yes |
| GET | `/api/v1/users/{userId}` | Get user by ID | Yes |
| PUT | `/api/v1/users/me` | Update profile | Yes |
| PUT | `/api/v1/users/me/password` | Change password | Yes |

### Analytics
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/analytics` | Financial analytics dashboard | Yes |

### Notifications
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/notifications` | List all notifications | Yes |
| GET | `/api/v1/notifications/recent` | Recent notifications (top 10) | Yes |
| GET | `/api/v1/notifications/unread-count` | Unread count | Yes |
| PATCH | `/api/v1/notifications/{id}/read` | Mark as read | Yes |
| PATCH | `/api/v1/notifications/read-all` | Mark all as read | Yes |

### Linked Accounts
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/linked-accounts` | Link a bank account | Yes |
| GET | `/api/v1/linked-accounts` | List linked accounts | Yes |
| GET | `/api/v1/linked-accounts/{id}` | Get account details | Yes |
| PUT | `/api/v1/linked-accounts/{id}` | Update account | Yes |
| DELETE | `/api/v1/linked-accounts/{id}` | Remove account | Yes |
| PATCH | `/api/v1/linked-accounts/{id}/primary` | Set as primary | Yes |
| PATCH | `/api/v1/linked-accounts/{id}/verify` | Verify account | Yes |

### Recurring Payments
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/recurring-payments` | Create recurring payment | Yes |
| GET | `/api/v1/recurring-payments` | List recurring payments | Yes |
| GET | `/api/v1/recurring-payments/{id}` | Get payment details | Yes |
| PATCH | `/api/v1/recurring-payments/{id}/pause` | Pause payment | Yes |
| PATCH | `/api/v1/recurring-payments/{id}/resume` | Resume payment | Yes |
| DELETE | `/api/v1/recurring-payments/{id}` | Cancel payment | Yes |

### Export
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/export/wallet-transactions` | Export wallet transactions CSV | Yes |
| GET | `/api/v1/export/transfers` | Export transfers CSV | Yes |

### QR Payments
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/qr-payments/generate` | Generate payment QR code | Yes |
| GET | `/api/v1/qr-payments/token/{token}` | Verify & inspect QR token | Yes |
| POST | `/api/v1/qr-payments/pay/{token}` | Pay via QR token | Yes |
| GET | `/api/v1/qr-payments/my-codes` | List generated QR codes | Yes |

### Transaction Disputes
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/disputes` | File a transfer dispute | Yes |
| GET | `/api/v1/disputes` | List user disputes | Yes |
| GET | `/api/v1/disputes/{disputeId}` | Get dispute details | Yes |

### Admin Dashboard & Management
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/admin/stats` | System aggregate statistics | Yes (Admin) |
| GET | `/api/v1/admin/users` | List & filter users | Yes (Admin) |
| GET | `/api/v1/admin/users/{userId}` | Get user detail view | Yes (Admin) |
| PATCH | `/api/v1/admin/users/{userId}/suspend` | Suspend user account | Yes (Admin) |
| PATCH | `/api/v1/admin/users/{userId}/activate` | Activate user account | Yes (Admin) |
| GET | `/api/v1/admin/disputes` | List all disputes | Yes (Admin) |
| PATCH | `/api/v1/admin/disputes/{disputeId}/resolve` | Resolve / reject dispute | Yes (Admin) |
| GET | `/api/v1/admin/kyc` | List pending KYC submissions | Yes (Admin) |
| PATCH | `/api/v1/admin/kyc/{kycId}/review` | Review & approve/reject KYC submission | Yes (Admin) |

### Identity Verification (KYC)
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/kyc` | Submit identity verification | Yes |
| GET | `/api/v1/kyc/latest` | Get latest KYC submission | Yes |
| GET | `/api/v1/kyc/history` | List KYC submission history | Yes |

### AI Financial Intelligence
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/ai/advisor` | Get AI financial health & smart insights | Yes |
| POST | `/api/v1/ai/ask` | Ask AI advisor custom financial question | Yes |

### Multi-Currency Foreign Exchange (FX)
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/fx/wallets` | List user multi-currency wallets | Yes |
| GET | `/api/v1/fx/rates` | List live exchange rates | Yes |
| POST | `/api/v1/fx/convert` | Execute instant currency conversion | Yes |

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
