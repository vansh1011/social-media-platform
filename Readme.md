
# Social Media Feed Platform

A simple  social media application built with Node.js, Express, React (Vite), and MongoDB. Features include user registration/login via Passport.js sessions, creating posts with image uploads, liking posts, and adding comments.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Vanilla CSS
* **Backend:** Node.js, Express, Passport.js (Local Session Strategy)
* **Database:** MongoDB

---

## 🚀 Local Setup Instructions

Follow these steps to run the application locally on your machine.

### 1. Clone the Project
```bash
git clone 
cd Social-media-platform

```

### 2. Backend Configuration

1. Open a terminal and navigate to the backend directory:
```bash
cd backend

```


2. Install the backend dependencies:
```bash
npm install

```


3. Create a `.env` file inside the `backend` folder and add your connection keys:
```env
DB_URL=mongodb+srv://<your_username>:<your_password>@cluster.mongodb.net/socialApp
SESSION_SECRET=any_secret_value
CLIENT=frontend_url
BACKEND_URL=backend_url


```


4. Start the backend development server:
```bash
node --watch server.js

```


*Your backend will run at:* `http://localhost:8000`

### 3. Frontend Configuration

1. Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend

```


2. Install the frontend dependencies:
```bash
npm install

```


3. Start the Vite development server:
```bash
npm run dev

```


*Your frontend will run at:* `http://localhost:5173`

---

## 🌐 Production Deployment Architecture

This project is optimized to run seamlessly across separate hosting providers using a **Vercel Forward Proxy Rewrite** system.

* **Frontend:** Deployed on **Vercel**
* **Backend:** Deployed on **Render**

### Deployment Configuration Checklist:

1. **Frontend Proxy:** Ensure `vercel.json` is configured in the frontend directory to route `/api/*` requests straight to your live Render API URL.
2. **Environment Flags:** Set `NODE_ENV=production` in your Render dashboard environment variables so session cookies switch dynamically to `secure: true` and `sameSite: 'lax'`.
