# WasteZero 🌱

**WasteZero** is a smart, interactive waste pickup and recycling platform designed to connect Volunteers, NGOs, and Waste Management Partners to collaborate toward a more sustainable future.

This repository is built as a **monorepo**, consisting of two main parts:
1. **Frontend**: A React application built with Vite.
2. **Backend**: A Node.js API built with Express, MongoDB, and Socket.io for real-time features.

---

## 🚀 Features

- **Role-Based Authentication**: Secure login and authorization tailored for three specific roles: `Admin`, `NGO`, and `Volunteer`.
- **Smart Pickup Scheduling**: Streamlined waste pickup requests and scheduling.
- **Opportunities & Applications**: NGOs can post volunteering opportunities, and Volunteers can browse and apply.
- **Real-Time Messaging**: Built-in, real-time chat powered by Socket.io so Volunteers and NGOs can communicate instantly.
- **Notifications**: Stay updated on the status of your applications and pickups.
- **Admin Management & Dashboard**: Robust admin tools for monitoring system activity, reviewing logs, and managing users and pickups.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (via [Vite](https://vitejs.dev/))
- **Routing**: `react-router-dom`
- **Data Fetching**: `axios`
- **Real-Time Communication**: `socket.io-client`
- **Styling**: Standard CSS Modules & Responsive Layouts

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB (managed via `mongoose`)
- **Real-Time Communication**: `socket.io`
- **Authentication**: `jsonwebtoken` (JWT) and `bcryptjs` for secure password hashing.
- **File Uploads**: `multer`
- **Email Service**: `nodemailer`

---

## 📁 Repository Structure

```text
wastezero2/
├── backend/                  # Node.js/Express API Server
│   ├── config/               # Database and environment configurations
│   ├── middleware/           # JWT and role-based auth middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express API endpoints
│   ├── utils/                # Helper functions
│   └── server.js             # Main server entry point
│
└── frontend/                 # React frontend application
    ├── public/               # Static assets
    ├── src/
    │   ├── Dashboard/        # Role-based dashboard components
    │   ├── pages/            # Application views (Login, Home, Settings, etc.)
    │   ├── layouts/          # Reusable UI layouts
    │   ├── services/         # Axios API interceptors and client methods
    │   ├── App.jsx           # Main App component with routing
    │   └── main.jsx          # React DOM entry point
    └── vite.config.js        # Vite configuration
```

---

## 🚦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+) and npm installed on your machine.
You will also need a running instance of **MongoDB** (either locally installed or hosted, e.g., MongoDB Atlas).

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` root with your configuration (replace with your local or remote variables):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/wastezero
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm start
   # or node server.js
   ```
   *The backend should now be running on `http://localhost:5000`.*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` root. Specify your backend API url:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running (usually on `http://localhost:5173`).*

---

## ☁️ Deployment

- **Backend**: Can be hosted on platforms like **Render**, **Railway**, or **Heroku**. Keep your environmental variables accurately set on the host platform.
- **Frontend**: Fully optimized and ready to deploy to **Vercel** or **Netlify**. Ensure you map `VITE_API_BASE_URL` to your production backend URL in your deployment provider's environment variables. 
- *Note: The frontend avoids relative imports and case-sensitive path issues to ensure Linux/Vercel compatibility out-of-the-box.*

---

