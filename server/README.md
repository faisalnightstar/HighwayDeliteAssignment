# Server-Side Application

This repository contains the backend for a web application, handling API requests, database interactions, authentication, and file uploads.

## Features

* **User Authentication**: Secure user registration, login, and session management using JWT (JSON Web Tokens) and `cookie-parser`.
* **Database Integration**: Connects to MongoDB using Mongoose for data persistence.
* **File Uploads**: Supports file uploads using Multer and Cloudinary for media storage.
* **API Structure**: Organized routing for users, trips, events, and reviews.
* **Error Handling**: Centralized error handling using custom `ApiError` class and middleware.
* **Asynchronous Operations**: Uses `asyncHandler` utility for robust handling of asynchronous operations.
* **CORS Configuration**: Configured to handle Cross-Origin Resource Sharing.

## Technologies Used

* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web framework for Node.js.
* **MongoDB**: NoSQL database.
* **Mongoose**: MongoDB object data modeling (ODM) library for Node.js.
* **jsonwebtoken**: For implementing JWT-based authentication.
* **bcrypt**: For hashing passwords securely.
* **cloudinary**: For cloud-based image and video management (uploads and deletions).
* **multer**: Middleware for handling `multipart/form-data`, primarily used for uploading files.
* **dotenv**: To load environment variables from a `.env` file.
* **cookie-parser**: Middleware to parse Cookie headers and populate `req.cookies`.
* **cors**: Node.js middleware for providing a Connect/Express middleware that can be used to enable CORS with various options.

## Project Structure

server/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── src/
├── app.js
├── constants.js
├── index.js
├── db/
│   └── index.js
├── middlewares/
│   ├── auth.middleware.js
│   └── multer.middleware.js
├── models/
│   └── user.model.js (Implicit - used in auth.middleware.js)
├── routes/
│   ├── user.routes.js (Implicit - imported in app.js)
│   ├── trip.routes.js (Implicit - imported in app.js)
│   ├── event.routes.js (Implicit - imported in app.js)
│   └── review.routes.js (Implicit - imported in app.js)
└── utils/
├── ApiError.js
├── ApiResponse.js
├── asyncHandler.js
└── cloudinary.js