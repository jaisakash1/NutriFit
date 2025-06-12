# NutriFit - Deployment Guide

This guide provides instructions for deploying the ComplanX full-stack application.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A MongoDB database (local or a cloud service like MongoDB Atlas)

## 1. Installation

First, install the dependencies for both the `backend` and `frontend`.

**Backend Dependencies:**
```bash
cd backend
npm install
```

**Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

## 2. Environment Configuration

The backend requires an `.env` file for configuration. In the `backend` directory, create a file named `.env` and add the following variables:

```env
# The port for the backend server
PORT=5000

# Your MongoDB connection string
MONGODB_URI=your_mongodb_connection_string

# The URL of your deployed frontend (for CORS)
# This should be the domain where you will host the application
FRONTEND_URL=http://your-production-domain.com

# A secret key for signing JWT tokens
JWT_SECRET=your_super_secret_jwt_key

# Set the environment to production
NODE_ENV=production
```

**Replace the placeholder values:**
- `your_mongodb_connection_string`: Your production MongoDB URI.
- `http://your-production-domain.com`: The final domain where the app will be accessible.
- `your_super_secret_jwt_key`: A long, random, and secure string.

## 3. Build the Frontend

Before starting the server, you need to create a production build of the frontend.

```bash
cd ../frontend
npm run build
```

This command will create a `dist` directory inside `frontend`. The backend is already configured to serve the files from this directory.

## 4. Run the Production Server

Now, you can start the backend server, which will also serve the frontend.

```bash
cd ../backend
npm start
```
*Note: You may need to add a `start` script to your `backend/package.json` file if it doesn't exist:*
`"start": "node server.js"`

Your application should now be running in production mode. You can access it at the `FRONTEND_URL` you configured in your `.env` file.

## Deployment to a Hosting Service (e.g., Heroku, Render, AWS)

When deploying to a hosting service, the process is similar:
1.  **Set Environment Variables**: Use the hosting platform's dashboard to set the environment variables from your `.env` file.
2.  **Build Command**: Configure the build command to install dependencies and build the frontend. A single command might look like this:
    `npm install && (cd frontend && npm install && npm run build)`
3.  **Start Command**: Set the start command to run the backend server: `node backend/server.js`.

This comprehensive guide should help you deploy your application successfully. Let me know if you have any questions! 