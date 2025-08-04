# HD Notes - Full-Stack Notes Application

**HD Notes** is a modern, secure, and full-stack web application designed as a technical assessment for the internship role. It features a pixel-perfect user interface built with React and a robust backend powered by Node.js, Express, and MongoDB. The application provides a seamless user experience with passwordless authentication and complete CRUD functionality for managing notes.

**Live Demo:**

-   **Frontend:** [https://highwaydelite-client.onrender.com/](https://highwaydelite-client.onrender.com/)
-   **Backend:** [https://highwaydelite-subi.onrender.com/](https://highwaydelite-subi.onrender.com/)

-   **Note:** The free instance will spin down with inactivity, which can delay requests by 50 seconds or more.

---

## Features

### Authentication & Security

-   **Passwordless Authentication:** Secure sign-up and sign-in using a one-time password (OTP) sent via email.
-   **Google OAuth 2.0:** Allow users to register and log in seamlessly with their Google accounts.
-   **JWT-Based Session Management:** Uses JSON Web Tokens (Access & Refresh) stored in secure, `httpOnly` cookies.
-   **Protected Routes:** Frontend routes are protected, preventing unauthenticated access to the dashboard.
-   **Backend Authorization:** API endpoints are secured with middleware to verify JWTs for all protected resources.

### Notes Management (CRUD)

-   **Create Notes:** Authenticated users can create new notes through an intuitive modal interface.
-   **Read Notes:** View a list of all created notes, sorted by the most recent.
-   **Delete Notes:** Securely delete notes with optimistic UI updates.

### Frontend User Experience

-   **Pixel-Perfect UI:** The user interface is meticulously crafted to match the provided Figma design.
-   **Fully Responsive:** The application is optimized for both desktop and mobile devices.
-   **State Management with React Context:** A centralized `AuthContext` manages user authentication state across the application.
-   **Skeleton Loaders:** Improves perceived performance by showing skeleton placeholders while data is being fetched.
-   **Toast Notifications:** Provides clear, non-intrusive feedback for user actions.
-   **Client-Side Routing:** Smooth navigation between pages using `react-router-dom`.

### Backend Architecture

-   **RESTful API:** A well-structured API built with Express.js and Mongoose.
-   **MVC Pattern:** Follows the Model-View-Controller architecture for organized and scalable code.
-   **Custom Error Handling:** Centralized error handling middleware for consistent API responses.
-   **Environment Variable Management:** Securely manages configuration and secrets using `dotenv`.

---

## Tech Stack

### Frontend

-   **React.js**
-   **Vite**
-   **Tailwind CSS**
-   **React Router DOM**
-   **React Hook Form**
-   **Axios**
-   **React Icons**
-   **React Hot Toast**

### Backend

-   **Node.js**
-   **Express.js**
-   **MongoDB** with **Mongoose**
-   **JSON Web Token (JWT)**
-   **Passport.js** (for Google OAuth)
-   **Nodemailer** (for OTP emails)

### Deployment

-   **Render** (for both Frontend Static Site and Backend Web Service)
-   **MongoDB Atlas** (for the database)

---

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn
-   Git
-   A MongoDB Atlas account and a connection URI.
-   A Google Cloud Platform account with OAuth 2.0 credentials.
-   An email service provider (like Mailtrap or a Gmail App Password) for sending OTPs.

---

### Installation & Setup

**1. Clone the repository:**

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

cd your-repo-name
```

**2. Set up the Backend:**

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following environment variables:

```dotenv
# server/.env

# Server Configuration

PORT=8001
CORS_ORIGIN=http://localhost:5174

# MongoDB Configuration

URI=<YOUR_MONGODB_ATLAS_URI_WITH_DB_NAME>

# JWT Secrets

ACCESS_TOKEN_SECRET=<YOUR_ACCESS_TOKEN_SECRET>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<YOUR_REFRESH_TOKEN_SECRET>
REFRESH_TOKEN_EXPIRY=10d

# Google OAuth Credentials

GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

# Nodemailer (Email) Configuration

MAIL_HOST=<YOUR_SMTP_HOST>
MAIL_PORT=<YOUR_SMTP_PORT>
MAIL_USER=<YOUR_SMTP_USERNAME>
MAIL_PASS=<YOUR_SMTP_PASSWORD_OR_APP_PASSWORD>
```

```bash
cd ../client
npm install
```

**4. Run the Application:**

-   Run the backend server:

```bash
# From the /server directory
npm run dev
```

-   Run the frontend client:

```bash
# From the /client directory
npm run dev
```

The frontend will be available at http://localhost:5174.

---

# API Endpoints

All endpoints are prefixed with `/api/v1.`

**User & Authentication** `(/users)`

| Method |        Endpoint        |                  Description                  | Protected |
| :----: | :--------------------: | :-------------------------------------------: | :-------: |
|  POST  |    /users/send-otp     | Sends a registration OTP to the user's email. |    No     |
|  POST  |    /users/register     |    Verifies OTP and registers a new user.     |    No     |
|  POST  |    /users/login-otp    |    Sends a login OTP to a registered user.    |    No     |
|  POST  |  /users/verify-login   |   Verifies login OTP and signs the user in.   |    No     |
|  POST  |   /users/resend-otp    |      Resends an OTP to the user's email.      |    No     |
|  GET   |     /users/google      |       Initiates the Google OAuth flow.        |    No     |
|  GET   | /users/google/callback |       Handles the callback from Google.       |    No     |
|  POST  |     /users/logout      |     Logs out the user and clears cookies.     |    Yes    |
|  GET   |       /users/me        |    Gets the currently authenticated user.     |    Yes    |

**Notes** `(/notes)`

| Method | Endpoint       | Description                  | Protected |
| ------ | -------------- | ---------------------------- | --------- |
| POST   | /notes         | Creates a new note.          | Yes       |
| GET    | /notes         | Gets all notes for the user. | Yes       |
| DELETE | /notes/:noteId | Deletes a specific note.     | Yes       |

---

# Deployment

This application is deployed on **Render.**

**_Frontend (Static Site)_**

-   **Build Command:** `bash npm run build`
-   **Publish Directory:** `dist`
-   **Rewrite Rule:** A rewrite rule is configured to handle client-side routing.

```
Source: /*
Destination: /index.html
Action: Rewrite
```

**_Backend (Web Service)_**

-   **Start Command:** ` npm start`

The backend service is connected to a MongoDB Atlas database. All environment variables are configured securely in the Render dashboard.

---

# **Author**

Faisal
Email: abufaisal.dev@gmail.com
