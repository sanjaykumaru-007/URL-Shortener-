# System Architecture

## High-Level Architecture Diagram

```mermaid
graph TD
    Client[React Frontend] -->|HTTPS| API[Express.js Backend API]
    Client -->|Static Assets| CDN[Vercel CDN]
    
    API -->|Read/Write| DB[(MongoDB Atlas)]
    API -->|GeoIP Lookup| Geo[geoip-lite]
    API -->|UA Parsing| UA[ua-parser-js]
    API -->|QR Generation| QR[qrcode]
    
    subgraph Frontend (Vercel)
        Client
        CDN
    end
    
    subgraph Backend (Render/Railway)
        API
        Auth[JWT Auth Middleware]
        Controllers[Controllers]
        Models[Mongoose Models]
    end
    
    subgraph Database
        DB
    end
    
    Auth --> API
    Controllers --> API
    Models --> DB
    
    User((End User)) -->|Clicks Short Link| API
    API -->|301 Redirect| User
    API -->|Record Click| DB
```

## Component Breakdown

### Frontend (React + Vite)
- **Routing**: React Router v6 for client-side navigation
- **State Management**: React Context API for Auth and Theme
- **Styling**: Tailwind CSS for utility-first responsive design
- **Charts**: Chart.js + react-chartjs-2 for analytics visualization
- **HTTP Client**: Axios with interceptors for JWT token injection

### Backend (Node.js + Express)
- **Authentication**: JWT-based stateless authentication with bcrypt password hashing
- **Rate Limiting**: express-rate-limit to prevent abuse
- **URL Generation**: UUID-based short codes with custom alias support
- **Analytics Tracking**: Real-time click tracking with GeoIP and User-Agent parsing
- **QR Codes**: Server-side QR code generation using the `qrcode` library

### Database (MongoDB)
- **User Model**: Stores user credentials and profile data
- **URL Model**: Stores original URL, short code, custom alias, expiry, and click counts
- **Click Model**: Stores detailed analytics per click (IP, country, browser, OS, device, referrer)
- **Indexes**: Optimized indexes on `shortCode`, `userId`, and `createdAt` for fast queries

## Security Features
1. **JWT Authentication**: Secure, stateless session management
2. **Password Hashing**: bcrypt with salt rounds for secure credential storage
3. **Rate Limiting**: Prevents brute-force and DDoS attacks on API endpoints
4. **CORS Configuration**: Restricts API access to authorized frontend origins
5. **Input Validation**: URL format validation and sanitization
6. **TTL Indexes**: MongoDB TTL indexes for automatic cleanup of expired URLs