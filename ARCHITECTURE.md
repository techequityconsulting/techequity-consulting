# TechEquity Website Architecture

## System Overview

This project is the **TechEquity client frontend** that communicates with the **AutoAssistPro multi-tenant SaaS backend**.

```
┌─────────────────────────────────────────────────────────────┐
│                     AutoAssistPro Backend                    │
│                   (localhost:3001 in dev)                    │
│                (autoassistpro.org in production)             │
│                                                              │
│  Multi-tenant SaaS API serving multiple clients:            │
│  - User authentication & management                          │
│  - Appointment scheduling & availability                     │
│  - Chat logs & conversations                                 │
│  - Client settings & configuration                           │
│  - Database persistence (PostgreSQL/MySQL)                   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ HTTP API Calls
                              │ (REST/JSON)
                              │
┌─────────────────────────────┴───────────────────────────────┐
│              TechEquity Website (THIS PROJECT)               │
│                   (localhost:3000 in dev)                    │
│              (techequity.com in production)                  │
│                                                              │
│  Next.js 15 Frontend Application                            │
│  - Marketing website                                         │
│  - Admin panel for managing appointments                     │
│  - Chat widget integration                                   │
│  - NO backend API routes (pure frontend)                     │
│  - NO database (data comes from AutoAssistPro)              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend (This Project)
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS 4
- **TypeScript:** Latest
- **Architecture:** App Router (Next.js 15)
- **Deployment:** Vercel (recommended) or any static host

### Backend (AutoAssistPro - Separate Repository)
- **Framework:** Node.js + Express (assumed)
- **Database:** PostgreSQL/MySQL
- **Authentication:** JWT/Session-based
- **API:** RESTful JSON API
- **Multi-tenancy:** Client-based data isolation

## Project Structure

```
techequity-website/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                  # Homepage (marketing site)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   │
│   ├── admin/                    # Admin Panel (private area)
│   │   ├── page.tsx              # Main admin orchestrator
│   │   ├── types/                # TypeScript interfaces
│   │   ├── components/           # Admin UI components
│   │   │   ├── AuthForm.tsx      # Login form
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── BookingsTab/      # Appointment management
│   │   │   ├── ChatLogsTab/      # Conversation viewer
│   │   │   ├── AvailabilityTab/  # Schedule management
│   │   │   ├── SettingsTab/      # Configuration
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts        # Authentication logic
│   │   │   ├── useAppointments/  # Appointment state management
│   │   │   ├── useAvailability/  # Availability state management
│   │   │   ├── useChatLogs/      # Chat logs state management
│   │   │   └── useSettings/      # Settings state management
│   │   │
│   │   └── utils/                # Utility functions
│   │       ├── apiConfig.ts      # API URL configuration (CRITICAL)
│   │       ├── apiAuth.ts        # Auth token management
│   │       └── passwordUtils.ts  # Password hashing (bcrypt)
│   │
│   ├── components/               # Shared components
│   │   ├── ResponsiveWrapper.tsx # Device-specific rendering
│   │   └── ...
│   │
│   └── hooks/                    # Shared custom hooks
│       └── useDeviceDetection.ts # Device type detection
│
├── public/                       # Static assets
│   ├── widget.js                 # Chat widget (embedded on site)
│   └── ...
│
├── node_modules/                 # Dependencies
├── .next/                        # Next.js build output
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── next.config.ts                # Next.js configuration
```

## Critical Configuration Files

### app/admin/utils/apiConfig.ts

**⚠️ MOST IMPORTANT FILE FOR API COMMUNICATION**

```typescript
export const getAdminApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';

  // CRITICAL: Points to AutoAssistPro backend
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'      // Development: AutoAssistPro backend
    : 'https://www.autoassistpro.org'; // Production: AutoAssistPro backend
};
```

**DO NOT** change this to point to localhost:3000 or create local API routes. This project is frontend-only.

## API Communication

### Authentication Flow

1. User enters credentials in `/admin`
2. Frontend calls `POST http://localhost:3001/api/admin/login`
3. AutoAssistPro backend validates credentials
4. Backend returns JWT/API key + user data
5. Frontend stores token in localStorage
6. All subsequent requests include this token

### Data Flow Example: Appointments

```
User Action (Admin Panel)
    ↓
useAppointments hook
    ↓
fetch('http://localhost:3001/api/appointments', {
  headers: { 'Authorization': 'Bearer <token>' }
})
    ↓
AutoAssistPro Backend
    ↓
Database Query (PostgreSQL)
    ↓
JSON Response
    ↓
Frontend Updates UI
```

## Environment Setup

### Development Requirements

1. **AutoAssistPro Backend** must be running on `localhost:3001`
   - Clone AutoAssistPro repository (separate project)
   - Start backend server: `npm start` or equivalent
   - Verify it's running: `curl http://localhost:3001/health` (if endpoint exists)

2. **TechEquity Frontend** runs on `localhost:3000`
   - This project
   - `npm run dev`
   - Accesses backend at `localhost:3001`

### Development Workflow

```bash
# Terminal 1: Start AutoAssistPro backend
cd /path/to/autoassistpro
npm start
# Server starts on localhost:3001

# Terminal 2: Start TechEquity frontend
cd /path/to/techequity-website
npm run dev
# Server starts on localhost:3000

# Access admin panel at http://localhost:3000/admin
```

## API Endpoints (AutoAssistPro Backend)

All endpoints are on the AutoAssistPro backend (`localhost:3001` in dev).

### Authentication
- `POST /api/admin/login` - User login
- `POST /api/admin/update-username` - Update username
- `POST /api/admin/update-password` - Update password

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments` - Update appointment
- `DELETE /api/appointments?id={id}` - Delete appointment
- `POST /api/appointments/bulk-delete` - Bulk delete

### Availability
- `GET /api/availability` - Get weekly schedule
- `POST /api/availability` - Update schedule

### Blackout Dates
- `GET /api/blackouts` - List blackouts
- `POST /api/blackouts` - Create blackout
- `DELETE /api/blackouts?id={id}` - Delete blackout

### Settings
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

### Chat Logs
- `GET /api/chat-logs` - List chat logs
- `GET /api/chat-logs?sessionId={id}` - Get session
- `DELETE /api/chat-logs?sessionId={id}` - Delete session
- `POST /api/admin/chat-logs/match-appointments` - Match with appointments

## State Management

### Pattern: Custom Hooks + Local State

Each major feature uses a custom hook for state management:

- **useAuth** - Authentication state (login, logout, session)
- **useAppointments** - Appointment CRUD operations
- **useAvailability** - Weekly schedule + blackout dates
- **useSettings** - Application settings
- **useChatLogs** - Chat conversation data

### Data Flow

```
Component (UI)
    ↓
Custom Hook (Business Logic)
    ↓
API Utility (HTTP Calls)
    ↓
AutoAssistPro Backend
    ↓
Database
```

### Example: Deleting an Appointment

```typescript
// Component
<button onClick={() => handleDelete(appointmentId)}>Delete</button>

// Hook (useAppointments)
const handleDelete = async (id: number) => {
  await deleteAppointmentApi(id); // API call
  await loadAppointments();       // Refresh data
};

// API Utility
const deleteAppointmentApi = async (id: number) => {
  await fetch(`${getAdminApiBaseUrl()}/api/appointments?id=${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getApiKey()}` }
  });
};
```

## Device-Responsive Architecture

### Three-Tier Responsive Design

The admin panel adapts to three device types:

1. **Mobile** (< 768px)
   - Full-screen layouts
   - Bottom navigation
   - Large touch targets (44px minimum)
   - Simplified UI, fewer columns

2. **Tablet** (768px - 1024px)
   - Side navigation
   - Medium touch targets
   - Two-column layouts
   - Balanced information density

3. **Desktop** (> 1024px)
   - Top navigation
   - Standard click targets
   - Multi-column layouts
   - Maximum information density

### ResponsiveWrapper Component

```typescript
<ResponsiveWrapper
  mobile={<MobileVersion />}
  tablet={<TabletVersion />}
  desktop={<DesktopVersion />}
/>
```

## Deployment

### Production URLs

- **Frontend:** `https://techequity.com`
- **Backend:** `https://www.autoassistpro.org`

### Environment Variables

Create `.env.local` (DO NOT commit):

```bash
# Not needed for this project since API URLs are in apiConfig.ts
# But if you add any environment-specific configuration:

NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Add others as needed
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run start

# Deploy to Vercel (recommended)
vercel deploy
```

## Common Mistakes to Avoid

### ❌ DO NOT: Create Local API Routes

```typescript
// ❌ WRONG - Do not create these files:
app/api/admin/login/route.ts
app/api/appointments/route.ts
// etc.
```

This project is frontend-only. All API calls go to AutoAssistPro.

### ❌ DO NOT: Change apiConfig.ts to localhost:3000

```typescript
// ❌ WRONG
return 'http://localhost:3000';

// ✅ CORRECT
return 'http://localhost:3001'; // AutoAssistPro backend
```

### ❌ DO NOT: Add Database Connections

This project has no database. Data comes from AutoAssistPro backend.

### ✅ DO: Always Call AutoAssistPro API

```typescript
// ✅ CORRECT
fetch(`${getAdminApiBaseUrl()}/api/appointments`, ...)
// Points to localhost:3001 in dev, autoassistpro.org in prod
```

## Troubleshooting

### "Failed to fetch" Error on Login

**Problem:** Cannot connect to AutoAssistPro backend

**Solution:**
1. Check if AutoAssistPro backend is running on `localhost:3001`
2. Test backend: `curl http://localhost:3001/api/admin/login`
3. Check apiConfig.ts is pointing to correct URL
4. Check CORS settings on backend (should allow localhost:3000)

### Data Not Loading

**Problem:** Authenticated but data doesn't load

**Solution:**
1. Check browser DevTools Network tab
2. Verify API calls are going to `localhost:3001`
3. Check authentication token in localStorage
4. Verify backend API endpoints are working
5. Check backend logs for errors

### Modal/UI Issues

**Problem:** UI components not working correctly

**Solution:**
1. Check browser console for React errors
2. Verify device detection is working
3. Clear browser cache and localStorage
4. Check component re-render issues

## Related Documentation

- [DEBUGGING_MODAL_BUG.md](./DEBUGGING_MODAL_BUG.md) - Debug guide for modal issues
- [README.md](./README.md) - Quick start guide
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## Questions?

If something is unclear about the architecture:

1. Check this document first
2. Look at the file structure and imports
3. Check apiConfig.ts to see where API calls go
4. Remember: This is frontend-only, backend is separate

## Version History

- **Current:** Frontend-only architecture with AutoAssistPro backend
- **Previous (incorrect):** Attempted to create local API routes (reverted)

**Last Updated:** 2025-01-24
