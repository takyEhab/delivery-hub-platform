# Delivery Hub Platform

A modern, full-stack platform for managing restaurant, seafood store, and delivery courier operations — from customer management and order intake to dispatching and real-time delivery tracking.

---

## 🌐 Live Deployments

| Component | Description | Live URL |
| :--- | :--- | :--- |
| **Prince of the Seas (أمير البحار)** | Specialized Seafood Operations & Courier Portal (Arabic & English) | [amir-elb7ar.vercel.app](https://amir-elb7ar.vercel.app) |
| **DeliveryHub Console** | General Restaurant Operations & Management Console | [delivery-hub-platform.vercel.app](https://delivery-hub-platform.vercel.app) |
| **Backend REST API** | Express.js & PostgreSQL Production API | [delivery-hub-platform-api.vercel.app](https://delivery-hub-platform-api.vercel.app) |

---

## 🌟 Key Features

### 1. Multi-Store Operations & Dual Frontends
- **Prince of the Seas (`frontend-fish-store`)**: Premium dark oceanic aesthetic built for seafood retail and kitchen operations. Features bilingual Arabic (RTL) / English (LTR) support, quick order creation, seafood cooking style chips, and a streamlined courier view.
- **DeliveryHub (`frontend`)**: Clean, modern dashboard designed for general restaurant operations, courier dispatching, and order lifecycle tracking.

### 2. Flexible Order Intake & Dispatching
- **Quick Order Mode**: Record fast orders with total amount, payment classification, and single-choice cooking style toggles (e.g., مشوي ردة, سنجاري, مقلي مقرمش, طاجن بالصلصة).
- **Detailed Itemized Mode**: Browse seafood presets (Fresh fish by kg, shrimp, squid, seafood meals) or add custom items with quantities and unit prices.
- **Optional Courier Assignment**: Assign an active delivery driver in one step during order creation, or leave it unassigned by default.
- **Order Lifecycle Pipeline**: Structured transitions (`preparing` ➔ `out_for_delivery` ➔ `delivered`) with audit timestamps.
- **Payment Tracking**: Track payment statuses (`unpaid` / cash on delivery, `paid`, and `postpaid` / credit) with custom collection notes.

### 3. Role-Based Access Control (RBAC) & Security
- **Owner (Admin)**: Full control over orders, analytics dashboard, couriers, customer management (adding, importing, editing, and protected deletion).
- **Delivery Driver (Courier)**: Isolated portal displaying only orders assigned to the logged-in driver. Couriers can advance delivery status, trigger 1-tap phone calls, launch Google Maps navigation, and update delivery notes/locations.
- **Data Privacy & Isolation**: Strict security controls ensure drivers **cannot** browse or query the general customer database (`/customers`). Drivers can only edit location and notes for customers with active orders assigned to them.

### 4. Smart Location & Google Maps Integration
- **Direct GPS Capture**: 1-click device GPS capture via browser Geolocation API to auto-fill customer coordinates.
- **Google Maps Navigation**: Automatic generation of Google Maps navigation links from addresses, URLs, or coordinates for seamless courier delivery.

### 5. Mobile Device Contact Import
- **Web Contacts API**: Seamlessly import customers directly from mobile device contacts (Android/Chrome) individually or in batches.
- **Duplicate Prevention**: Phone number normalization and server-side checks to prevent duplicate customer profiles.

---

## 🏗️ Tech Stack

- **Backend:**
  - **Runtime & Framework:** Node.js (>=18), Express.js
  - **Database:** PostgreSQL (with `pg` connection pool, Neon-compatible)
  - **Authentication & Security:** JWT (JSON Web Tokens), bcrypt password hashing, role-based authorization
  - **Validation:** Joi schema validation
  - **Tooling:** CORS, dotenv
- **Frontend Applications:**
  - **Core Framework:** React 18, Vite
  - **Routing:** React Router v6
  - **Styling:** Tailwind CSS, PostCSS, Autoprefixer
  - **Icons:** Lucide React
  - **HTTP Client:** Axios (with unified interceptors and token management)
  - **Localization:** Context-driven RTL/LTR engine supporting Arabic and English

---

## 📁 Repository Structure

```
delivery-hub-platform/
├── backend/                  # REST API server
│   ├── src/
│   │   ├── config/           # Database and environment configuration
│   │   ├── controllers/      # Route controllers (auth, orders, customers, drivers)
│   │   ├── db/               # PostgreSQL connection and modular queries
│   │   ├── middleware/       # JWT authentication, role authorization, Joi validation
│   │   ├── routes/           # Express route definitions
│   │   ├── utils/            # Custom AppError and helper utilities
│   │   └── validators/       # Joi request payload schemas
│   ├── scripts/              # Database seeding scripts
│   ├── schema.sql            # PostgreSQL schema definition
│   └── package.json
│
├── frontend-fish-store/      # Prince of the Seas (أمير البحار)
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── components/       # UI components (Orders, Customers, Layout, Modals)
│   │   ├── context/          # LanguageContext (AR/EN, RTL/LTR), AuthContext
│   │   ├── pages/            # Dashboard, Orders, OrderDetails, Customers, Drivers, Login
│   │   └── utils/            # GPS location, formatting, contacts integration
│   └── package.json
│
├── frontend/                 # DeliveryHub general operations dashboard
│   ├── src/
│   │   ├── api/              # API clients
│   │   ├── components/       # Layout, UI components, modals
│   │   ├── pages/            # Dashboard, Orders, Customers, Drivers, Login
│   │   └── utils/            # Google Maps helpers, contact pickers
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Local instance or cloud provider like Neon / Supabase)

### 1. Database Setup
Create a PostgreSQL database and execute the schema:
```bash
psql -d <YOUR_DATABASE_URL> -f backend/schema.sql
```

### 2. Configure Backend
Navigate to `backend/` and create `.env`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/delivery_hub
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

Install dependencies and start backend:
```bash
cd backend
npm install
npm run db:seed    # Seeds default admin/owner user
npm run dev        # Starts server on http://localhost:5000
```

### 3. Configure Frontend (Prince of the Seas)
Navigate to `frontend-fish-store/` and configure `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and run:
```bash
cd frontend-fish-store
npm install
npm run dev        # Launches on http://localhost:5173
```

### 4. Configure Frontend (DeliveryHub)
Navigate to `frontend/` and configure `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and run:
```bash
cd frontend
npm install
npm run dev        # Launches on http://localhost:5174
```

---

## 📡 API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user and receive JWT token + user profile.
- `GET /api/auth/me` — Retrieve currently authenticated user profile.

### Orders (`/api/orders`)
- `GET /api/orders` — List orders (Owners see all orders; Drivers see only assigned orders).
- `GET /api/orders/:id` — Retrieve single order details.
- `POST /api/orders` — Create new order (with existing or inline customer, optional driver assignment, and items).
- `PATCH /api/orders/:id/status` — Advance order status (`preparing` ➔ `out_for_delivery` ➔ `delivered`).
- `PATCH /api/orders/:id/payment` — Update payment status (`unpaid`, `paid`, `postpaid`) and payment notes.
- `PATCH /api/orders/:id/assign` — Assign or reassign order to a delivery courier *(Owner only)*.
- `PATCH /api/orders/:id` — Edit order items, total amount, and notes *(Owner only)*.

### Customers (`/api/customers`)
- `GET /api/customers` — List all customers *(Owner only)*.
- `GET /api/customers/search?q=` — Search customers by name, phone, or address *(Owner only)*.
- `POST /api/customers` — Create customer profile *(Owner only)*.
- `PATCH /api/customers/:id` — Update customer details (Owners can update any field; Drivers can update address, location URL, and notes for customers with active assigned orders).
- `DELETE /api/customers/:id` — Permanently remove customer *(Owner only)*.

### Drivers (`/api/drivers`)
- `GET /api/drivers` — List active delivery couriers.
- `POST /api/drivers` — Register new delivery driver *(Owner only)*.
- `PATCH /api/drivers/:id` — Update driver status or details *(Owner only)*.
- `DELETE /api/drivers/:id` — Deactivate/remove driver *(Owner only)*.

---

## 🔒 Security & Privacy Practices

- **Zero-Exposure Customer Privacy**: Courier accounts are strictly disallowed from viewing or searching the full customer database.
- **Row-Level Assignment Scoping**: Couriers can only view and update customer metadata belonging to orders currently dispatched to them.
- **SQL Injection Prevention**: All SQL interactions use parameterized queries via the `pg` pool.
- **Input Sanitization & Validation**: Request bodies are strictly validated against Joi schemas before hitting controller logic.
- **Cryptographic Password Hashing**: Driver and owner passwords are encrypted with `bcrypt` (10 salt rounds).

---

## 📄 License

This project is licensed under the MIT License.