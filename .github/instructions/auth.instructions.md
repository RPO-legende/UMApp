---
applyTo: '**'
---

# Authentication System - Passport.js + JWT + PostgreSQL

Complete authentication implementation using Passport.js Local Strategy and JWT tokens with PostgreSQL database.

## Quick Reference

### Stack
- **Backend**: Express + Passport.js + JWT + bcrypt + PostgreSQL (postgres package)
- **Frontend**: React + Context API + localStorage
- **Database**: PostgreSQL schema `RPO_Projekt.user` (user_id, email, first_name, password_hash)

### Endpoints
- `POST /api/auth/register` - Register (email, name, password) → returns {user, token}
- `POST /api/auth/login` - Login (email, password) → returns {user, token}
- `GET /api/profile/me` - Get user profile (requires `Authorization: Bearer <token>`)

### Environment Variables (.env)
```bash
JWT_SECRET=your-secret-key-change-in-production
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
```

## Backend Architecture

### File Structure
```
backend/src/
├── auth/
│   ├── types.ts              # UserProfile, RegisterDto, LoginDto, AuthResponse, JwtPayload
│   ├── authData.ts           # DB queries: findUserByEmail, findUserById, createUser
│   ├── passport.ts           # Passport strategies (Local + JWT)
│   ├── middleware.ts         # authenticateJWT middleware for protected routes
│   ├── AuthController.ts     # TSOA: register & login endpoints
│   └── ProfileController.ts  # TSOA: /profile/me endpoint
├── db.ts                     # PostgreSQL connection using 'postgres' package
└── server.ts                 # Express app with passport.initialize()
```

### Key Implementation Details

**Database Schema** (RPO_Projekt.user table):
- `user_id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE NOT NULL)
- `first_name` (VARCHAR)
- `password_hash` (VARCHAR 255)

## Frontend Architecture

### File Structure
```
frontend/src/
├── contexts/
│   └── AuthContext.tsx          # Auth state + useAuth hook
├── components/
│   ├── ProtectedRoute.tsx       # Route guard component
│   └── site/navbar.tsx          # Updated with user menu & logout
├── pages/
│   ├── Login.tsx                # Login form
│   └── Register.tsx             # Registration form
├── lib/
│   └── api.ts                   # API client with auto JWT headers
├── app/
│   ├── router.tsx               # Routes with /login, /register
│   └── layout.tsx               # App layout
└── main.tsx                     # Wrapped with AuthProvider
```

### Key Implementations

**AuthContext**: Manages `{user, token, login(), register(), logout(), isAuthenticated, isLoading}`
- Stores token in localStorage
- Auto-loads on app start
- Provides global auth state

**API Client** (`lib/api.ts`):
- `apiGet/Post/Put/Delete()` - Auto-adds `Authorization: Bearer <token>`
- `apiUpload()` - File uploads with auth
- Token from localStorage

**ProtectedRoute**: Wraps protected pages, redirects to `/login` if not authenticated

**Navbar**: Shows user name when logged in, login/signup buttons when not, logout button

## Usage Examples

```tsx
// Use auth in component
const { user, login, logout, isAuthenticated } = useAuth();

// Protected route
<ProtectedRoute><YourPage /></ProtectedRoute>

// API call with auto JWT
const data = await apiGet('/profile/me');
await apiPost('/notes', { title: 'Note' });
```

## Testing

1. **Backend**: `cd backend && npm run dev` (port 3000)
2. **Frontend**: `cd frontend && npm run dev`
3. **Swagger**: http://localhost:3000/api-docs
4. **Test flow**: Register → Login → Access protected route → Logout

## Security Notes

- Passwords: bcrypt hash (10 rounds), min 6 chars
- JWT: 7-day expiry, signed with JWT_SECRET
- Token storage: localStorage (consider httpOnly cookies for production)
- Protected routes: JWT middleware checks Bearer token
- **Production TODO**: Strong JWT_SECRET, HTTPS, rate limiting, email verification

## Troubleshooting

- **Unauthorized**: Check Authorization header `Bearer <token>`, verify JWT_SECRET matches
- **DB errors**: Ensure PostgreSQL running, check .env credentials
- **TSOA errors**: Run `npm run tsoa:gen` in backend
- **Type conflicts**: UserProfile (auth) vs User (users API) - keep separate

Consider adding:
- Email verification
- Password reset flow
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- Role-based access control (RBAC)
- Session management
- Refresh token rotation
- Account management (update profile, change password)
