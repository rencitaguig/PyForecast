# Weather App - Setup Guide

## ✅ Complete Full-Stack Implementation

Your weather application now has a complete authentication system with a React frontend and Node.js backend!

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server will run on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173` (or next available port)

---

## 🔐 Authentication System

### Backend Features (already implemented)
- ✅ **User Model** (`backend/models/User.js`)
  - Email & username (unique)
  - Password hashing with bcryptjs (10 rounds)
  - User preferences (units: metric/imperial, theme)
  - Favorites array for saved cities

- ✅ **Auth Routes** (`backend/routes/auth.js`)
  - `POST /api/auth/register` - Create new account
  - `POST /api/auth/login` - Login with email/password
  - `GET /api/auth/me` - Get current user (protected)
  - `PUT /api/auth/preferences` - Update user preferences (protected)

- ✅ **Auth Middleware** (`backend/middleware/auth.js`)
  - JWT token verification
  - Protects routes with `authMiddleware`

### Frontend Features (newly implemented)
- ✅ **Login Page** (`frontend/src/Login.jsx`)
  - Email/password form
  - Error handling and loading states
  - Link to register page
  - Stores JWT token in localStorage on success

- ✅ **Register Page** (`frontend/src/Register.jsx`)
  - Email/username/password registration form
  - Password confirmation validation
  - Minimum 6-character password requirement
  - Error handling and loading states
  - Link to login page

- ✅ **Auth Context** (`frontend/src/AuthContext.jsx`)
  - Global authentication state management
  - `token` - JWT stored in localStorage
  - `user` - Current user object
  - `isAuthenticated` - Login status
  - Methods: `login()`, `register()`, `logout()`, `updateUser()`

- ✅ **Protected App** (`frontend/src/App.jsx`)
  - Conditional rendering based on authentication
  - Shows Login/Register if not authenticated
  - Shows weather app if authenticated
  - Logout button in header
  - Username display in header

- ✅ **Auth Styling** (`frontend/src/styles.css`)
  - Beautiful purple gradient background for auth pages
  - Form styling with focus states
  - Error message display
  - Responsive design

---

## 🔄 Authentication Flow

1. **User visits app** → Frontend checks localStorage for `authToken`
2. **If no token** → Login/Register pages shown
3. **User registers/logs in** → Backend validates and returns JWT + user data
4. **Frontend stores token** → Saved to localStorage automatically
5. **Token persists** → User stays logged in on page reload
6. **Logout** → Token removed from localStorage, redirects to login

---

## 📝 API Endpoints

### Public Endpoints
```
POST /api/auth/register
  Body: { email, username, password, confirmPassword }
  Response: { token, user }

POST /api/auth/login
  Body: { email, password }
  Response: { token, user }
```

### Protected Endpoints (require Authorization header)
```
GET /api/auth/me
  Headers: { Authorization: "Bearer <token>" }
  Response: { user }

PUT /api/auth/preferences
  Headers: { Authorization: "Bearer <token>" }
  Body: { units: "metric"|"imperial", theme: "light"|"dark"|"auto" }
  Response: { user }
```

---

## 🔒 Security Notes

- **JWT Secret**: Change `JWT_SECRET` in `.env` for production
- **Password Hashing**: bcryptjs with 10 rounds
- **Token Expiry**: 7 days
- **localStorage**: Token stored client-side (vulnerable in XSS attacks - consider httpOnly cookies for production)

---

## 🌦️ Weather Features (Previously Implemented)

- ✅ 7-day forecast with daily low/high temps
- ✅ 24-hour forecast with Chart.js visualization
- ✅ Current weather with precipitation data
- ✅ Temperature unit toggle (°C/°F)
- ✅ Day/night background based on sunrise/sunset
- ✅ Right-side drawer modal for detailed hourly breakdown
- ✅ Weather icons for different conditions
- ✅ Multiple API fallback (One Call → 5-day forecast)

---

## 📦 Technology Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS enabled
- dotenv for configuration

### Frontend
- React 18
- Vite build tool
- Axios for HTTP requests
- Chart.js for visualizations
- Context API for state management

### APIs
- OpenWeatherMap (current, forecast, One Call)
- MongoDB Atlas

---

## ✨ Next Steps (Optional Enhancements)

1. **Save Favorites**
   - Wire `/api/cities` routes to UI
   - Allow users to save/manage favorite cities
   - Store in `User.favorites` array

2. **Load User Preferences**
   - Fetch user preferences on login
   - Apply saved units/theme automatically

3. **Password Reset**
   - Email verification flow
   - Password reset endpoint

4. **Token Refresh**
   - Implement refresh token mechanism
   - Auto-refresh JWT before expiry

5. **Social Login**
   - Google OAuth integration
   - GitHub authentication

6. **Production Deployment**
   - Change JWT_SECRET to strong random string
   - Use HTTPS only
   - Implement rate limiting
   - Add CSRF protection
   - Use httpOnly, secure cookies instead of localStorage

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB Atlas cluster is accessible
- Verify IP whitelist in MongoDB Atlas

**"Login fails with 500 error"**
- Check backend logs for error messages
- Verify User model is properly initialized
- Check bcryptjs/JWT dependencies are installed

**"Frontend shows loading forever"**
- Check if backend is running on port 5000
- Check browser console for CORS errors
- Verify axios is calling correct URLs

**"Token not persisting on refresh"**
- Check browser localStorage (DevTools → Application)
- Check if `localStorage.setItem()` is working
- Verify AuthContext useEffect is running

---

## 📞 Support

For questions or issues, check:
1. Browser console (DevTools → Console)
2. Backend logs (npm run dev output)
3. Network tab (DevTools → Network)
4. MongoDB Atlas activity logs
