# 🚀 Delivery Hub Platform — Dual-Frontend Showcase

A modern, mobile-first delivery operations and courier dispatch platform built with **React 18**, **Tailwind CSS**, and **Vite**. 

This repository showcases two distinct frontend implementations of the platform:
1. **Prince of the Seas (أمير البحار)**: A high-end, dark-oceanic themed retail and kitchen operations portal with bilingual Arabic (RTL) / English (LTR) localization, quick cooking-style tags, raw food indicators, and a dedicated mobile courier view.
2. **DeliveryHub Pro**: A clean, universal B2B operations and fleet dispatch console designed for multi-store management and cloud kitchens.

Both applications feature **100% In-Browser Standalone Sandbox Mode** — recruiters and reviewers can test all features interactively with instant 1-click demo logins without requiring an active backend or database.

---

## 🌐 Live Interactive Demos

| Application | Style & Target | Features Highlight | Live Demo |
| :--- | :--- | :--- | :--- |
| **Prince of the Seas (أمير البحار)** | Bespoke Dark Oceanic (Retail Seafood) | Bilingual AR/EN, RTL/LTR engine, seafood cooking presets, courier GPS navigation, Web Contact Picker | [Live Sandbox Demo](https://prince-of-the-seas-demo.vercel.app) |
| **DeliveryHub Pro** | Clean Light Mode (Universal B2B SaaS) | Order lifecycle pipeline, courier dispatching, customer address management, KPI metrics | [Live Sandbox Demo](https://deliveryhub-demo.vercel.app) |

> 💡 **Recruiter Tip:** On either login screen, click **`[ Demo Manager ]`** or **`[ Demo Courier ]`** to log in instantly with 1 click. You can also click **`[ ↺ Reset ]`** in the top bar to restore clean initial data at any time.

---

## 🌟 Key Architecture & Features

### 1. Dual-Role Experience (Store Manager & Delivery Courier)
- **Store Manager / Dispatcher**:
  - Full operations dashboard with live KPI counters (Preparing, Out for Delivery, Delivered).
  - Flexible order intake: Itemized mode with calculated totals or Quick Mode with single-choice toggles.
  - Active courier assignment & reassignment.
  - Customer directory with address search and duplicate phone validation.
- **Delivery Courier**:
  - Mobile-optimized interface showing orders assigned to the logged-in courier.
  - 1-tap phone calls and instant Google Maps navigation links.
  - 1-tap delivery status advancement (`preparing` ➔ `out_for_delivery` ➔ `delivered`).
  - Cash on delivery & payment status tracking (`unpaid`, `paid`, `postpaid`).

### 2. Smart Mobile & Location Integrations
- **Web Contact Picker API**: Import customer contacts directly from mobile device phonebooks (Android/Chrome) with deduplication and phone number normalization.
- **HTML5 Geolocation API**: 1-click device GPS capture to save precise delivery coordinates.
- **Google Maps Navigation**: Automatic generation of Google Maps navigation URLs from addresses, URLs, or GPS coordinate strings.

### 3. Localization & Domain Specialization
- **Bilingual RTL/LTR Engine**: Dynamic context-driven translation between Egyptian Arabic and English with automatic HTML `dir="rtl"` and font swapping (Cairo & Outfit).
- **Domain Specialization**: Tailored for seafood retail with cooking styles (*مشوي ردة*, *سنجاري*, *مقلي مقرمش*, *طاجن بالصلصة*), fresh fish by kg, and raw fish safety alerts for kitchen staff.

### 4. Zero-Backend In-Browser Sandbox Engine
- Powered by a reactive in-browser mock storage engine (`localStorage`).
- Simulates real full-stack mutations: order creation, courier assignment, status updates, and deletions happen instantly in the browser tab.
- Zero server cold starts, 100% uptime, and complete isolation from private client data.

---

## 🏗️ Tech Stack

- **Core Framework:** React 18, Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Audio:** Web Audio API synthesized delivery notification chime
- **State & Storage:** Context API, Custom Hooks, Reactive `localStorage` Sandbox Engine

---

## 📁 Repository Structure

```
delivery-hub-platform/
├── frontend-fish-store/      # Prince of the Seas (Bilingual Dark Oceanic Portal)
│   ├── src/
│   │   ├── api/              # Mock storage adapter & API clients
│   │   ├── components/       # Orders, Customers, Couriers, Layout, UI Modals
│   │   ├── context/          # LanguageContext (AR/EN), AuthContext, ToastContext
│   │   ├── pages/            # Dashboard, Orders, OrderDetails, Customers, Drivers, Login
│   │   └── utils/            # GPS location, Contact Picker, phone normalization
│   └── package.json
│
├── frontend/                 # DeliveryHub Pro (Clean B2B Operations Console)
│   ├── src/
│   │   ├── api/              # Mock storage adapter & API clients
│   │   ├── components/       # Layout, Orders, Customers, Drivers, Modals
│   │   ├── pages/            # Dashboard, Orders, OrderDetails, Customers, Drivers, Login
│   │   └── utils/            # Google Maps helpers, Contact Picker
│   └── package.json
│
└── README.md
```

---

## 🚀 Running Locally

### 1. Run Prince of the Seas (Fish Store)
```bash
cd frontend-fish-store
npm install
npm run dev
# Opens at http://localhost:5173
```

### 2. Run DeliveryHub Pro (Console)
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5174
```

---

## 📄 License

This showcase project is licensed under the MIT License.