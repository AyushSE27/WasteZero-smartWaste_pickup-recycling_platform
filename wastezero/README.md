# WasteZero - Smart Waste Management System

A modern web application for managing waste pickup schedules, tracking collections, and promoting environmental sustainability.

## Features

- 🌍 Smart waste management scheduling
- 📍 Real-time pickup tracking
- ♻️ Eco-friendly impact tracking
- 🎁 Community rewards system
- 🔐 Secure user authentication
- 📱 Responsive design

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom styling)
- JavaScript (Vanilla)
- Google Fonts (Poppins)

**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## Installation

### 1. Clone or Download the Project

```bash
# If you have the files, navigate to the project directory
cd wastezero
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

The `.env` file is already created with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://admin:Admin@123@cluster0.hv1ixaq.mongodb.net/wastezero?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=wastezero-super-secret-key-change-in-production-2026
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANT SECURITY NOTES:**
- Change the `JWT_SECRET` before deploying to production
- Never commit the `.env` file to version control
- Consider using environment-specific configurations

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
wastezero/
├── index.html          # Landing page
├── login.html          # Login page
├── register.html       # Registration page
├── style.css           # All styles
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env               # Environment variables
└── README.md          # This file
```

## API Endpoints

### Authentication

**Register a new user:**
```
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login:**
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get user profile (Protected):**
```
GET /api/profile
Authorization: Bearer <your-jwt-token>
```

### Health Check

```
GET /api/health
```

## MongoDB Database Structure

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date (default: now)
}
```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000/index.html`

3. **Create an account:**
   - Click "Register" in the navigation
   - Fill in your email and password
   - Submit the form

4. **Login:**
   - Click "Login" in the navigation
   - Enter your credentials
   - You'll receive a JWT token for authenticated requests

## Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Update the `MONGODB_URI` in your hosting platform's environment variables
2. Set a strong `JWT_SECRET`
3. Deploy the code
4. Update the `API_BASE_URL` in `script.js` to your deployed backend URL

### Frontend Deployment (Netlify/Vercel)

1. Update `API_BASE_URL` in `script.js` to point to your deployed backend
2. Deploy the HTML/CSS/JS files
3. Ensure CORS is properly configured on the backend

## Security Considerations

- ✅ Passwords are hashed using bcryptjs
- ✅ JWT tokens for stateless authentication
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation on both frontend and backend
- ⚠️ Change default JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for API endpoints
- ⚠️ Add email verification for registration

## Troubleshooting

### MongoDB Connection Issues

If you see "MongoDB connection error":
1. Check your internet connection
2. Verify the MongoDB URI is correct
3. Ensure your IP address is whitelisted in MongoDB Atlas
4. Check if the password contains special characters (they may need URL encoding)

### CORS Errors

If you see CORS errors in the browser console:
1. Ensure the backend server is running
2. Check that CORS is enabled in `server.js`
3. Verify the `API_BASE_URL` in `script.js` matches your backend URL

### Port Already in Use

If port 3000 is already in use:
1. Change the `PORT` in `.env` to another port (e.g., 3001)
2. Update `API_BASE_URL` in `script.js` accordingly
3. Or kill the process using port 3000

## Future Enhancements

- 📅 Waste pickup scheduling system
- 🗺️ GPS tracking for collection vehicles
- 📊 Analytics dashboard
- 📧 Email notifications
- 📱 Mobile app (React Native)
- 🎯 Gamification and rewards system
- 🔔 Push notifications
- 💳 Payment integration

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Made with ♻️ for a cleaner, greener planet**
