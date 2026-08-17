# EzCA (Easy CA) 📊
### Chartered Accountant Firm Client Portal & Tax Filing Management Platform

EzCA is a modern, multi-tenant digital workspace designed for Chartered Accountants (CA firms), tax professionals, and their clients. It streamlines tax return filings, document requests, income tax computation, client communication, e-filing acknowledgment tracking, and payments in one unified interface.

---

## ✨ Key Features

### 👤 Client Portal
- **Filing Progress Tracker:** Live status updates for income tax filing (FY/AY), required documents, review state, and completion.
- **Document Management:** Secure upload checklist with status indicators (Pending, Under Review, Approved, Rejected) and version history.
- **Tax Computation View:** Detailed breakdown of taxable income, tax liability, deductions (80C, 80D, etc.), and refund estimates.
- **Payments & Downloads:** Integrated fee payments and secure download unlocking for finalized tax documents.

### 🏢 CA Admin & Staff Portal
- **Client & Filing Management:** Comprehensive dashboard to manage clients, PAN/DOB details, financial years, and active tax filings.
- **Document Review Engine:** Inline review, approval/rejection workflows with feedback comments, and additional document requests.
- **Tax Computation Engine:** Interactive tax computation tool to calculate liability under both Old and New Tax Regimes.
- **ACK & Status Tracking:** Monitor e-filing status, ITR acknowledgment numbers, and filing verification progress.
- **Staff & Permission Control:** Role-based access control (CA Admin vs. CA Staff) for managing client portfolios and firm duties.
- **Firm Branding & White-Labeling:** Multi-tenant customization for firm branding, logos, support info, and custom color themes.
- **Audit Logs & Security:** Detailed log tracking for user actions, document downloads, IP addresses, and compliance reporting.
- **Automated Deadlines & Reminders:** Calendar view and tracking for tax deadlines, client reminders, and payment follow-ups.

### 🤖 Gemini AI Integration
- Powered by `@google/genai` for intelligent document processing, insights, and automated client assistance.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations & Icons:** [Motion](https://motion.dev/) (Framer Motion), [Lucide React](https://lucide.dev/)
- **Backend / Server:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx)
- **AI Integration:** `@google/genai` (Google Gemini API)
- **Build & Bundle:** ESBuild, Vite

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher recommended)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/yuvarajvasam/ezca-prototype.git
cd ezca-prototype
npm install
```

### 2. Environment Configuration
Create a `.env` or `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Running the App
Start the development server:
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite in development mode |
| `npm run build` | Builds the frontend with Vite and bundles `server.ts` into `dist/server.cjs` |
| `npm start` | Runs the production bundled server from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript type checking without emitting files |
| `npm run clean` | Cleans `dist/` build artifacts |

---

## 📂 Project Structure

```
ezca-prototype/
├── server.ts               # Express server entry point & API endpoints
├── vite.config.ts          # Vite configuration
├── src/
│   ├── main.tsx            # Application entry point
│   ├── App.tsx             # Main router & state coordinator
│   ├── types.ts            # Domain data structures (Clients, Filings, Roles)
│   ├── index.css           # Tailwind CSS imports & global styles
│   └── components/
│       ├── admin/          # CA Admin & Staff dashboard views
│       ├── client/         # Client portal views & filing status
│       ├── auth/           # Login & role switcher components
│       ├── chat/           # Client-CA messaging component
│       ├── common/         # Reusable UI components & modals
│       └── v2/             # Next-gen interface modules
└── README.md
```

---

## 🔒 Security & Privacy

- Role-Based Access Control (RBAC) ensuring clients only access their own filings.
- Audit logging for security compliance and tracking file download events.
- Masked PAN and sensitive data formatting across client-facing interfaces.
