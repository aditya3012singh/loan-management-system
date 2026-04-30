# Loan Management System (LMS)

A full-stack Loan Management System built with **Next.js**, **Express.js**, **TypeScript**, and **MongoDB**. The platform enables borrowers to apply for loans through a multi-step portal, while internal executives manage the complete loan lifecycle (Applied → Sanctioned → Disbursed → Closed) via a role-based operations dashboard.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| State      | Redux Toolkit (RTK)                           |
| Backend    | Node.js, Express.js 5, TypeScript             |
| Database   | MongoDB with Mongoose                         |
| Auth       | JWT + bcryptjs                                |
| Validation | Zod (server & client)                         |
| Upload     | Multer (PDF/JPG/PNG, max 5 MB)                |


## Project Structure

```
loan-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Route handlers (auth, loan, payment, document, user)
│   │   ├── middlewares/     # JWT auth, RBAC, file upload
│   │   ├── models/          # Mongoose schemas (User, Loan, Payment, Document)
│   │   ├── routes/          # Express route definitions
│   │   ├── index.ts         # Server entry point
│   │   └── seed.ts          # Database seed script
│   ├── uploads/             # Stored salary slips
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── app/             # Next.js App Router pages
    │   │   ├── page.tsx           # Login
    │   │   ├── register/page.tsx  # Registration
    │   │   ├── portal/page.tsx    # Borrower Portal (sidebar layout)
    │   │   └── dashboard/page.tsx # Operations Dashboard (sidebar layout)
    │   ├── components/
    │   │   ├── portal/      # Borrower views (ApplyLoan, BorrowHistory, Profile)
    │   │   └── dashboard/   # Ops views (Sales, Sanction, Disbursement, Collection)
    │   ├── store/           # Redux Toolkit (store, authSlice, StoreProvider)
    │   └── lib/             # Axios API client
    ├── package.json
    └── tsconfig.json
```

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Clone the repository
```bash
git clone <repo-url>
cd loan-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install --legacy-peer-deps

# Create environment file
cp .env.example .env

# Seed database with test users
npm run seed

# Start dev server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start dev server (runs on port 3000)
npm run dev
```

### 4. Open the app
Navigate to **http://localhost:3000** in your browser.

---

## Login Credentials (Seeded)

All accounts use the password: **`password123`**

| Role          | Email                    |
|---------------|--------------------------|
| Admin         | admin@lms.com            |
| Sales         | sales@lms.com            |
| Sanction      | sanction@lms.com         |
| Disbursement  | disbursement@lms.com     |
| Collection    | collection@lms.com       |
| Borrower      | borrower1@test.com       |
| Borrower      | borrower2@test.com       |

---

## Features

### Borrower Portal (`/portal`)
1. **Apply for Loan** — Multi-step form with personal details, salary slip upload, and interactive loan configuration sliders.
2. **Borrow History** — View all past and current loan applications with status tracking.
3. **Profile** — View registered account details.

### Business Rule Engine (BRE)
All eligibility checks run **server-side** in the loan controller:

| Rule              | Rejection Condition            |
|-------------------|--------------------------------|
| Age               | Not between 23 and 50          |
| Monthly Salary    | Below ₹25,000                  |
| PAN               | Does not match `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/` |
| Employment        | Applicant is Unemployed        |

### Loan Math (Simple Interest)
```
SI = (P × R × T) / (365 × 100)
Total Repayment = P + SI

Where:
  P = Principal (Loan Amount: ₹50,000 – ₹5,00,000)
  R = Annual Interest Rate (12%)
  T = Tenure in days (30 – 365)
```

### Operations Dashboard (`/dashboard`)
| Module        | Functionality                                                |
|---------------|--------------------------------------------------------------|
| Sales         | View registered borrowers who haven't applied yet            |
| Sanction      | Approve (→ SANCTIONED) or Reject (→ REJECTED with reason)   |
| Disbursement  | Mark sanctioned loans as DISBURSED                           |
| Collection    | Record payments (unique UTR), track outstanding, auto-close  |

### Loan Lifecycle
```
APPLIED → SANCTIONED → DISBURSED → CLOSED
    ↘ REJECTED
```

### Role-Based Access Control (RBAC)
- **Frontend**: Sidebar navigation dynamically shows only the modules the logged-in role can access.
- **Backend**: Every API endpoint is guarded by `verifyToken` (JWT) + `checkRole` (RBAC) middleware. Unauthorized requests return `401` or `403`.

| Role         | Access                                      |
|--------------|---------------------------------------------|
| Admin        | All dashboard modules                       |
| Sales        | Sales module only                           |
| Sanction     | Sanction module only                        |
| Disbursement | Disbursement module only                    |
| Collection   | Collection module only                      |
| Borrower     | Borrower Portal only (no dashboard access)  |

---

## API Endpoints

### Auth
| Method | Endpoint            | Description       | Auth |
|--------|---------------------|--------------------|------|
| POST   | `/api/auth/register`| Register borrower  | No   |
| POST   | `/api/auth/login`   | Login              | No   |

### Loans
| Method | Endpoint                  | Description                | Auth / Role                |
|--------|---------------------------|----------------------------|----------------------------|
| POST   | `/api/loans/apply`        | Apply for a loan           | Borrower                   |
| GET    | `/api/loans/my-loans`     | Get borrower's own loans   | Borrower                   |
| GET    | `/api/loans?status=X`     | Get loans by status        | Admin, Sanction, Disbursement, Collection |
| PATCH  | `/api/loans/:id/status`   | Update loan status         | Admin, Sanction, Disbursement |

### Payments
| Method | Endpoint               | Description            | Auth / Role       |
|--------|------------------------|------------------------|--------------------|
| POST   | `/api/payments`        | Record a payment       | Admin, Collection  |
| GET    | `/api/payments/:loanId`| Get payments for a loan| Authenticated      |

### Documents
| Method | Endpoint                | Description          | Auth / Role |
|--------|-------------------------|----------------------|-------------|
| POST   | `/api/documents/upload` | Upload salary slip   | Borrower    |

### Users
| Method | Endpoint               | Description                             | Auth / Role    |
|--------|------------------------|-----------------------------------------|----------------|
| GET    | `/api/users/borrowers` | Get borrowers without loan applications | Admin, Sales   |

---

## Database Collections

| Collection | Key Fields                                                                 |
|------------|---------------------------------------------------------------------------|
| Users      | name, email, password (hashed), role, pan, dob, salary, employmentMode    |
| Loans      | userId (ref), amount, tenure, interestRate, totalRepayment, status, rejectionReason |
| Payments   | loanId (ref), utr (unique), amount, date                                 |
| Documents  | userId (ref), loanId (ref), fileUrl, type                                |

---

## Environment Variables

| Variable     | Description                  | Default                          |
|-------------|------------------------------|----------------------------------|
| `PORT`      | Backend server port          | `5000`                           |
| `MONGO_URI` | MongoDB connection string    | `mongodb://127.0.0.1:27017/lms`  |
| `JWT_SECRET`| JWT signing secret           | (required)                       |
