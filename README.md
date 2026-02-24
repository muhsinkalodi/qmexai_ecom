# Qmexai - Modern Fashion E-commerce Webapp

This repository contains the source code for Qmexai, a sleek, modern, and high-performance Fashion E-commerce web application.

The application is split into two distinct parts:
1. `frontend`: Next.js (App Router) based frontend leveraging Vanilla CSS for complete modern design control.
2. `backend`: FastAPI Python backend with SQLite, handling robust Auth, Order Management, and strictly protected Admin APIs.

## Directory Structure
- `/frontend`: Next.js Web App
- `/backend`: FastAPI Python App

## Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.10+ (for backend)

### 1. Setting up the Backend
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create a virtual environment & install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. **Environment Variables:**
   Copy the `../.env.template` file to `.env` inside the `backend` directory and fill in the values.
4. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

### 2. Setting up the Frontend
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Copy the `../.env.template` file to `.env.local` inside the `frontend` directory and add required frontend values.
4. **Run the Next.js development server:**
   ```bash
   npm run dev
   ```

## Deployment
- **Frontend**: Can be quickly deployed to Vercel by linking the GitHub repository and setting the Root Directory to `frontend`.
- **Backend**: Can be deployed to Render or equivalent services by setting the build command to `pip install -r requirements.txt` and start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`.

## Features
- **Frontend**:
  - 3D-style interactive product cards
  - Dynamic side-cart drawer
  - Skeleton loaders for smooth UX
  - Sleek modern Admin Dashboard with Revenue analytics charts
- **Backend**:
  - Secure JWT authentication with Role-Based Access Control (RBAC)
  - Automatic Order Processing on view
  - Actionable PDF Invoice generation
