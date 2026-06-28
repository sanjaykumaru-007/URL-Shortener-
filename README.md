# LinkShrink - Full-Stack URL Shortener with Analytics

A production-ready, scalable URL shortening service with comprehensive analytics, built with the MERN stack (MongoDB, Express.js, React, Node.js).

> **This project is a part of a hackathon run by https://katomaran.com**

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT and bcrypt
- **URL Management**: Create, edit, delete, and copy shortened URLs
- **Custom Aliases**: Personalize your short links
- **Expiry Dates**: Set automatic expiration for temporary links
- **QR Code Generation**: Instant QR codes for every shortened URL
- **Comprehensive Analytics**: Track total clicks, unique visitors, geographic data, browsers, devices, and historical trends
- **Dashboard**: Searchable, paginated table with real-time statistics
- **Dark Mode**: Full dark mode support with persistent preferences
- **Responsive Design**: Mobile-first SaaS-style UI built with Tailwind CSS
- **Bulk Operations**: CSV upload support for bulk URL shortening (backend ready)

## 🏗️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Chart.js + react-chartjs-2
- react-toastify (Notifications)
- lucide-react (Icons)
- qrcode.react

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- geoip-lite (Geolocation)
- ua-parser-js (Device/Browser detection)
- qrcode (QR generation)
- express-rate-limit

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and environment configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── models/         # Mongoose schemas (User, Url, Click)
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Helper functions (URL gen, QR, analytics)
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Theme)
│   │   ├── pages/          # Route components
│   │   ├── services/       # API client (Axios)
│   │   ├── utils/          # Frontend helpers
│   │   ├── App.jsx         # Main app component with routing
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Tailwind CSS imports
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── vercel.json             # Frontend deployment config
├── render.yaml             # Backend deployment config
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/url-shortener
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file in the `frontend` directory (optional, defaults to localhost):

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/profile` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### URLs
- `POST /api/urls` - Create a new shortened URL (Protected)
- `GET /api/urls` - Get paginated list of user's URLs (Protected)
- `GET /api/urls/:id` - Get specific URL details (Protected)
- `PUT /api/urls/:id` - Update URL settings (Protected)
- `DELETE /api/urls/:id` - Delete a URL (Protected)
- `GET /api/urls/public/:shortCode` - Get public URL info
- `GET /api/urls/r/:shortCode` - Redirect endpoint (records analytics)

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard summary stats (Protected)
- `GET /api/analytics/url/:id` - Get detailed analytics for a URL (Protected)

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`
4. Deploy

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set Build Command: `cd backend && npm install`
4. Set Start Command: `cd backend && npm start`
5. Add Environment Variables:
   - `MONGODB_URI` (Your MongoDB Atlas connection string)
   - `JWT_SECRET` (A strong random string)
   - `FRONTEND_URL` (Your Vercel deployment URL)
   - `NODE_ENV=production`
6. Deploy

## 🛡️ Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Authentication**: Stateless, secure session management
- **Rate Limiting**: 100 requests per 15 minutes per IP on API routes
- **CORS**: Configured to only allow requests from the frontend origin
- **Input Validation**: URL format validation and sanitization
- **MongoDB Indexing**: Optimized queries and unique constraints

## 📝 Assumptions

1. Users are trusted to provide valid destination URLs (validated for http/https protocol)
2. GeoIP data is approximate and based on the `geoip-lite` database
3. Unique clicks are determined by IP address within a 24-hour rolling window
4. The application assumes a single-tenant or multi-tenant SaaS model where users only see their own data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

---

*This project is a part of a hackathon run by https://katomaran.com*