# TechEquity Consulting - Migration Context Document

**Version:** 1.0
**Date:** October 25, 2025
**Status:** Pre-Migration Analysis
**Purpose:** Document TechEquity's current architecture before migrating from duplicated scheduling code to iframe-based AutoAssistPro booking integration

---

## Executive Summary

TechEquity Consulting (www.techequityconsulting.com) currently integrates with AutoAssistPro using:
- **Widget integration** for chat functionality (working correctly)
- **Duplicated scheduling code** that replicates AutoAssistPro's booking system (TO BE REPLACED)

**Why We're Migrating:**
- TechEquity has duplicated the entire booking modal, form handling, and API logic
- This creates maintenance overhead and version sync issues
- The migration will replace this with an iframe-based approach where AutoAssistPro serves the booking UI
- This keeps TechEquity lightweight while maintaining the same functionality

**What Must Be Preserved:**
- TechEquity's branding (blue/cyan gradient color scheme)
- Widget integration and event handling (autoassistpro:schedule-call, autoassistpro:booking-confirmed)
- Session ID passing from widget to booking flow
- Device-responsive behavior (mobile/tablet/desktop)

---

## Current Architecture

### 1. Project Structure

**Framework:** Next.js 15.5.5 (App Router)
**React Version:** 19.1.0
**Styling:** Tailwind CSS 4
**TypeScript:** 5
**Deployment:** Likely Vercel (based on Next.js setup)

```
techequity-website/
├── app/
│   ├── admin/                    # Admin panel (separate, not part of migration)
│   ├── components/               # Main site components
│   │   ├── SchedulingModal.tsx   # ⚠️ TO BE REPLACED
│   │   ├── HeroSection.tsx       # ✅ PRESERVE
│   │   ├── AboutSection.tsx      # ✅ PRESERVE
│   │   ├── ServicesSection.tsx   # ✅ PRESERVE
│   │   ├── ContactSection.tsx    # ✅ PRESERVE
│   │   ├── Header.tsx            # ✅ PRESERVE
│   │   ├── Footer.tsx            # ✅ PRESERVE
│   │   ├── TrustedPartnersSection.tsx  # ✅ PRESERVE
│   │   └── ResponsiveWrapper.tsx # ✅ PRESERVE (utility)
│   ├── hooks/
│   │   ├── useScheduling.ts      # ⚠️ TO BE REPLACED
│   │   ├── useFormData.ts        # ⚠️ TO BE REPLACED
│   │   └── useWidgetBookingIntegration.ts  # ⚠️ MODIFY (keep but update)
│   ├── types/
│   │   └── index.ts              # ✅ KEEP (FormData, DateSlot, TimeSlot types)
│   ├── utils/                    # Device detection utilities
│   ├── page.tsx                  # Main page - ⚠️ MODIFY
│   ├── layout.tsx                # Root layout - ✅ PRESERVE
│   ├── globals.css               # Global styles - ✅ PRESERVE
│   └── widget-overrides.css      # Widget customization - ✅ PRESERVE
├── public/
│   ├── widget.js                 # AutoAssistPro widget (588KB) - ✅ PRESERVE
│   ├── favicon.svg               # TechEquity branding - ✅ PRESERVE
│   └── images/                   # Brand assets - ✅ PRESERVE
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config files
```

### 2. AutoAssistPro Widget Integration

**Current Widget Setup:**

**Location:** app/page.tsx:130-167

```javascript
// Widget Configuration (app/page.tsx:138-151)
window.AutoAssistProConfig = {
  apiKey: 'pk_live_techequity_cbb31add4925bad252950cd9d9ff7ad0',
  clientId: 'client_techequity_001',
  position: 'bottom-right',
  primaryColor: '#0ea5e9',
  companyName: 'TechEquity Consulting',
  botName: 'Renan',
  greeting: 'Hi! How can we help you today?',
  debug: true,
  apiBaseUrl: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://www.autoassistpro.org'
};
```

**Widget Script Loading:**
- Source: `/widget.js?v=2` (public/widget.js - 588KB file)
- Strategy: `afterInteractive` (Next.js Script component)
- Location: Loaded in app/page.tsx:157-165

**Widget Customization:**
- Custom CSS: app/widget-overrides.css (input field color fixes)
- Imported in: app/layout.tsx:4

---

### 3. Custom Scheduling Implementation (TO BE REPLACED)

This is the core of what needs to be migrated. TechEquity has duplicated the entire booking flow.

#### 3.1 SchedulingModal Component

**File:** app/components/SchedulingModal.tsx (887 lines)

**What it does:**
- Provides device-responsive booking modal (Mobile/Tablet/Desktop variants)
- Mobile: Multi-step wizard (3 steps: Info → DateTime → Confirmation)
- Tablet: Two-column form (Info + DateTime side-by-side)
- Desktop: Traditional stacked form

**Form Fields:**
- firstName, lastName, email, phone, company, interest
- Date selection (7-14 days depending on device)
- Time slot selection (2-5 slots shown depending on device)

**Dependencies:**
- useDeviceDetection hook
- ResponsiveWrapper component
- Device-specific styling and touch target sizes

#### 3.2 useScheduling Hook

**File:** app/hooks/useScheduling.ts (400 lines)

**Responsibilities:**
1. **Load available time slots** from AutoAssistPro API
   - Endpoint: `${apiBaseUrl}/api/availability/check?days=${days}`
   - Uses widget's apiKey and apiBaseUrl from window.AutoAssistProConfig
   - Device-aware: Mobile shows 3 slots/day, Tablet 5, Desktop all slots

2. **Save appointments** to AutoAssistPro API
   - Endpoint: `${apiBaseUrl}/api/appointments`
   - POST with Authorization: Bearer ${apiKey}
   - Includes: formData, date, time, chatSessionId, deviceType

3. **Manage modal state**
   - showSchedulingModal, selectedDate, selectedTime
   - isLoadingSlots, isBooking

**Key Functions:**
- `loadAvailableSlots()` - Fetches slots with retry logic
- `saveAppointment()` - Posts booking to API
- `handleScheduleCall()` - Opens modal and loads slots
- `handleBookingConfirmation()` - Validates and saves appointment

**API Authentication:**
- Gets apiKey from: `window.AutoAssistProConfig.apiKey`
- Gets apiBaseUrl from: `window.AutoAssistProConfig.apiBaseUrl`
- Headers: `Authorization: Bearer ${apiKey}`

#### 3.3 useFormData Hook

**File:** app/hooks/useFormData.ts (523 lines)

**Responsibilities:**
1. Form state management for FormData interface
2. Device-aware validation (different rules for mobile/tablet/desktop)
3. Input sanitization and formatting
4. Phone number auto-formatting
5. Email/name validation
6. Field length limits per device type

**Key Features:**
- Auto-capitalize first/last names
- Format phone: (555) 123-4567
- Sanitize company field (handles spaces during typing)
- Device-specific placeholders and error messages

#### 3.4 useWidgetBookingIntegration Hook

**File:** app/hooks/useWidgetBookingIntegration.ts (48 lines)

**Current Behavior:**
- Listens for `autoassistpro:schedule-call` event from widget
- Extracts sessionId, userName, clientId from event
- Calls onScheduleCallClick callback with sessionId
- This sessionId is passed through to appointment booking

**Event Flow:**
```
Widget "Book Call" button clicked
  → Fires autoassistpro:schedule-call event
  → useWidgetBookingIntegration catches it
  → Extracts sessionId
  → Opens SchedulingModal with sessionId
  → User fills form and confirms
  → Appointment saved with sessionId attached
  → Fires autoassistpro:booking-confirmed event
```

**MIGRATION NOTE:** This hook will need to be updated to open an iframe instead of the modal.

---

### 4. Styling & Branding (TO BE PRESERVED)

#### 4.1 Color Scheme

**Primary Colors:**
- Blue: `#0ea5e9` (sky-500) - Primary brand color
- Cyan: `#06b6d4` (cyan-500) - Accent/gradient
- Gradient: `from-blue-600 to-cyan-600` (most CTAs)

**Background Gradients:**
- Hero: `from-slate-950 via-blue-950 to-indigo-950`
- Sections: `from-slate-800 to-slate-900`
- Cards: `bg-white/5 backdrop-blur-sm` with `border-white/10`

**Text Colors:**
- Headlines: White (`text-white`)
- Body: `text-gray-300`
- Accents: Blue/cyan variations

#### 4.2 Typography

**Fonts:**
- Primary: Geist Sans (loaded via next/font/google)
- Monospace: Geist Mono
- Fallback: Arial, Helvetica, sans-serif

**Font Sizes (Desktop):**
- Hero headline: `text-7xl lg:text-8xl` (72px-96px)
- Section headings: `text-4xl` (36px)
- CTAs: `text-xl` (20px)

#### 4.3 Component Styling Patterns

**Buttons (CTAs):**
```css
bg-gradient-to-r from-blue-600 to-cyan-600
hover:from-blue-700 hover:to-cyan-700
text-white px-12 py-6 rounded-xl text-xl font-semibold
transition-all duration-300 shadow-xl hover:scale-105
```

**Badge/Pill Components:**
```css
bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full
backdrop-blur-sm border border-blue-500/30
```

**Cards:**
```css
bg-white/5 backdrop-blur-sm rounded-lg p-6
border border-white/10 hover:bg-white/10
```

**Grid Background Effect:**
```css
bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),
    linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
bg-[size:24px_24px]
```

#### 4.4 Custom CSS Files

**app/globals.css:**
- Tailwind imports
- CSS variables: `--background`, `--foreground`
- Input field color fixes (dark gray text, medium gray placeholder)

**app/widget-overrides.css:**
- Fixes widget input text color: `#1f2937`
- Fixes widget placeholder color: `#9ca3af`
- Targets: `#autoassistpro-widget-root input`

#### 4.5 Logo and Assets

**Favicon:** public/favicon.svg (TechEquity logo)

**Images:**
- public/images/gabriel-cook.jpg (founder photo)
- public/images/seattle-skyline.jpg (location branding)
- public/images/operations-team.jpg (service imagery)
- public/images/security-datacenter.jpg (cybersecurity visual)
- public/images/ai-automation.jpg (AI services)
- public/images/partners/ (partner logos)

---

### 5. Page Structure

**Main Pages:**
1. **Homepage (app/page.tsx)** - Main landing page
   - Header (sticky navigation)
   - HeroSection
   - AboutSection
   - TrustedPartnersSection
   - ServicesSection
   - ContactSection
   - Footer
   - SchedulingModal (overlay)

2. **Admin Panel (app/admin/)** - Separate admin interface
   - Not part of public site
   - Has own booking management
   - Uses same AutoAssistPro API

**Navigation Sections (IDs for scrolling):**
- `#home` - Top of page
- `#about` - About section
- `#services` - Services section
- `#contact` - Contact/CTA section

**Where Widget Appears:**
- Widget button: Bottom-right corner (all pages)
- Triggered from: Hero CTA, Contact section buttons
- Modal appears: Center overlay when "Schedule Call" clicked

---

## Integration Points

### Current Widget Integration

**Initialization Code (app/page.tsx:138-151):**

```javascript
window.AutoAssistProConfig = {
  apiKey: 'pk_live_techequity_cbb31add4925bad252950cd9d9ff7ad0',
  clientId: 'client_techequity_001',
  position: 'bottom-right',
  primaryColor: '#0ea5e9',
  companyName: 'TechEquity Consulting',
  botName: 'Renan',
  greeting: 'Hi! How can we help you today?',
  debug: true,
  apiBaseUrl: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://www.autoassistpro.org'
};
```

**Loading Strategy:**
1. Config script runs with `strategy="afterInteractive"`
2. Widget script loads from `/widget.js?v=2`
3. Widget initializes using config
4. Event listeners registered by useWidgetBookingIntegration hook

### Event Handling

**Event 1: autoassistpro:schedule-call**

**Fired by:** AutoAssistPro widget when user clicks "Book a Call" button

**Handled in:** app/hooks/useWidgetBookingIntegration.ts:24-36

**Payload:**
```javascript
{
  detail: {
    sessionId: string,     // Chat session ID
    userName: string,      // User's name from chat
    clientId: string       // Client identifier
  }
}
```

**Current Flow:**
```
Widget fires event
  → useWidgetBookingIntegration catches it
  → Extracts sessionId
  → Calls onScheduleCallClick(sessionId)
  → app/page.tsx:72-80 handleScheduleCall
  → Stores sessionId in state
  → Opens SchedulingModal
```

**Event 2: autoassistpro:booking-confirmed**

**Fired by:** TechEquity website after successful booking

**Dispatched in:** app/page.tsx:95-97

**Payload:**
```javascript
{
  detail: {
    dayName: string,    // "Monday, October 28, 2025"
    time: string,       // "10:00 AM"
    email: string       // User's email
  }
}
```

**Purpose:** Notifies widget that booking was completed so it can show confirmation message in chat

### API Communication

**Direct API Calls Made by TechEquity:**

**Call 1: Get Available Slots**
- **Endpoint:** `GET ${apiBaseUrl}/api/availability/check?days=${days}`
- **Headers:**
  - `Authorization: Bearer ${apiKey}`
  - `Content-Type: application/json`
- **Location:** app/hooks/useScheduling.ts:64-70
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "availableSlots": [
        {
          "date": "2025-10-28",
          "dayName": "Monday, October 28, 2025",
          "slots": [
            { "time": "10:00 AM", "value": "10:00" },
            { "time": "2:00 PM", "value": "14:00" }
          ]
        }
      ]
    }
  }
  ```

**Call 2: Create Appointment**
- **Endpoint:** `POST ${apiBaseUrl}/api/appointments`
- **Headers:**
  - `Authorization: Bearer ${apiKey}`
  - `Content-Type: application/json`
- **Location:** app/hooks/useScheduling.ts:161-169
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "phone": "5551234567",
    "company": "Acme Corp",
    "interest": "operations",
    "date": "2025-10-28",
    "time": "10:00 AM",
    "chatSessionId": "session_123",
    "deviceType": "desktop",
    "isTouchDevice": false,
    "bookingMethod": "desktop_form"
  }
  ```

**Authentication Details:**
- API Key: Retrieved dynamically from `window.AutoAssistProConfig.apiKey`
- Base URL: Retrieved from `window.AutoAssistProConfig.apiBaseUrl`
- Development: `http://localhost:3001`
- Production: `https://www.autoassistpro.org`

---

## What Needs to Change

### Files to Delete (After Migration)

**Complete Removal:**
1. `app/components/SchedulingModal.tsx` (887 lines)
   - Mobile/Tablet/Desktop modal components
   - Form rendering logic
   - Device-specific layouts

2. `app/hooks/useScheduling.ts` (400 lines)
   - Slot loading logic
   - Appointment saving logic
   - Modal state management

3. `app/hooks/useFormData.ts` (523 lines)
   - Form validation
   - Input sanitization
   - Device-aware field handling

**Total Lines Removed:** ~1,810 lines of code

### Files to Modify

**1. app/hooks/useWidgetBookingIntegration.ts**

**Current:** Opens SchedulingModal with sessionId

**New Behavior:**
```javascript
// Instead of opening modal, open iframe
const handleScheduleCall = (event: Event) => {
  const customEvent = event as CustomEvent;
  const { sessionId } = customEvent.detail;

  // Open iframe to AutoAssistPro booking page
  const iframeUrl = `${apiBaseUrl}/booking?clientId=${clientId}&sessionId=${sessionId}`;
  openBookingIframe(iframeUrl);
};
```

**Changes:**
- Remove: Call to local modal
- Add: Function to create and show iframe
- Add: Iframe container component/logic
- Keep: Event listener for autoassistpro:schedule-call
- Keep: Session ID extraction

**2. app/page.tsx**

**Lines to Modify:** 72-103, 180-194

**Remove:**
- Import of SchedulingModal component (line 17)
- Import of useScheduling hook (line 20)
- Import of useFormData hook (line 21)
- scheduling and formData hook initializations (lines 26-27)
- widgetSessionId state (line 30)
- handleScheduleCall function (lines 72-80)
- handleBookingConfirmation function (lines 84-103)
- SchedulingModal JSX (lines 180-194)

**Add:**
- Iframe container div (hidden by default)
- Iframe state management
- Function to open/close iframe
- Listen for booking completion from iframe (postMessage)

**Estimated Changes:** ~50 lines removed, ~30 lines added

**3. app/components/ContactSection.tsx**

**Current:** handleScheduleClick is a placeholder function (line 15-18)

**New:** Should trigger widget booking flow or open iframe directly

**Change:** Update function to dispatch custom event or call booking integration

### Files to Keep Unchanged

**Branding & Content:**
- ✅ app/components/HeroSection.tsx
- ✅ app/components/AboutSection.tsx
- ✅ app/components/ServicesSection.tsx
- ✅ app/components/TrustedPartnersSection.tsx
- ✅ app/components/Header.tsx
- ✅ app/components/Footer.tsx
- ✅ app/components/ResponsiveWrapper.tsx

**Styling:**
- ✅ app/globals.css
- ✅ app/widget-overrides.css
- ✅ app/layout.tsx

**Widget Integration:**
- ✅ public/widget.js
- ✅ Widget configuration in app/page.tsx

**Types (May Need Minor Updates):**
- ✅ app/types/index.ts (FormData, DateSlot types still useful for reference)

**Utilities:**
- ✅ app/utils/ (device detection, styling utilities)

**Assets:**
- ✅ public/images/
- ✅ public/favicon.svg

---

## Migration Readiness

### What's Ready ✅

- ✅ Widget integration working correctly
- ✅ Event system in place (autoassistpro:schedule-call, autoassistpro:booking-confirmed)
- ✅ API keys configured and tested
- ✅ Session ID passing from widget to booking flow
- ✅ Authentication headers properly formatted
- ✅ Device-responsive design patterns established
- ✅ Branding/styling well-documented

### What Needs Preparation ⚠️

#### On AutoAssistPro Side:

1. **⚠️ Create booking-only view/route**
   - Standalone booking page (no chat UI)
   - Accepts parameters: `?clientId=xxx&sessionId=xxx`
   - Styled with TechEquity branding (blue/cyan)
   - Returns to parent via postMessage on completion

2. **⚠️ Implement iframe communication**
   - postMessage API for booking confirmation
   - Height adjustment messages for responsive iframe
   - Close/cancel messages

3. **⚠️ Support query parameters**
   - clientId: Identify which client's booking system to use
   - sessionId: Link booking to chat session
   - theme: Optional branding overrides

4. **⚠️ Cross-origin setup**
   - CORS headers for iframe embedding
   - Content-Security-Policy for embedding from TechEquity domain

#### On TechEquity Side:

1. **⚠️ Create IframeBookingContainer component**
   - Manages iframe lifecycle
   - Handles postMessage communication
   - Applies TechEquity styling/overlay
   - Device-responsive sizing

2. **⚠️ Update useWidgetBookingIntegration**
   - Change from modal trigger to iframe trigger
   - Pass sessionId via URL parameter

3. **⚠️ Test booking flow end-to-end**
   - Widget → iframe → booking → confirmation
   - Verify sessionId tracking
   - Test on mobile/tablet/desktop

4. **⚠️ Handle edge cases**
   - Iframe load failures
   - Network timeouts
   - User closes iframe mid-flow

### Potential Risks

**Risk 1: Session ID Not Passed Correctly**
- **Impact:** Bookings won't be linked to chat sessions
- **Mitigation:** Extensive logging and testing
- **Severity:** Medium

**Risk 2: Iframe Styling Doesn't Match TechEquity Branding**
- **Impact:** Jarring UX, looks disconnected
- **Mitigation:** Pass theme parameters to AutoAssistPro
- **Severity:** Medium

**Risk 3: Mobile Iframe Experience Poor**
- **Impact:** High bounce rate on mobile bookings
- **Mitigation:** Full-screen iframe on mobile with proper viewport
- **Severity:** High

**Risk 4: Slower Load Time (External Iframe)**
- **Impact:** Users abandon before booking form loads
- **Mitigation:** Loading indicator, optimize AutoAssistPro booking page
- **Severity:** Medium

**Risk 5: Breaking Admin Panel**
- **Impact:** Admin can't manage bookings
- **Mitigation:** Admin panel separate, shouldn't be affected
- **Severity:** Low

**Risk 6: Widget Events Stop Working**
- **Impact:** Can't trigger booking from chat
- **Mitigation:** Widget code unchanged, only handler changes
- **Severity:** Low

---

## Dependencies

### Current package.json

```json
{
  "dependencies": {
    "bcrypt": "^6.0.0",
    "lucide-react": "^0.545.0",
    "next": "15.5.5",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcrypt": "^6.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**AutoAssistPro-Related:**
- None! Widget is vanilla JS loaded from public/widget.js
- No npm packages to update

**Migration Impact:**
- No new dependencies needed
- May remove types from app/types/index.ts if FormData no longer used

---

## Build & Deployment

### Build Commands

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

**Development:**
```bash
npm run dev
# Runs on http://localhost:3000
# Widget connects to http://localhost:3001
```

**Production Build:**
```bash
npm run build
# Creates optimized production build in .next/
```

**Production Start:**
```bash
npm run start
# Serves production build
```

### Environment Variables

**Current Setup:**
- No .env files found in repository
- Configuration is hardcoded in app/page.tsx
- API key visible in source: `pk_live_techequity_cbb31add4925bad252950cd9d9ff7ad0`

**Environment Detection:**
```javascript
apiBaseUrl: window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://www.autoassistpro.org'
```

**Recommended for Migration:**
Create `.env.local` for API keys:
```
NEXT_PUBLIC_AUTOASSISTPRO_API_KEY=pk_live_techequity_cbb31add4925bad252950cd9d9ff7ad0
NEXT_PUBLIC_AUTOASSISTPRO_CLIENT_ID=client_techequity_001
NEXT_PUBLIC_AUTOASSISTPRO_API_URL=https://www.autoassistpro.org
```

### Domain Configuration

**Production Domain:** www.techequityconsulting.com (assumed)

**Hosting Platform:** Vercel (likely, based on Next.js)

**Deployment:**
- Automatic deploys from git repository
- Preview URLs for branches
- Production deploy from main branch

**DNS/CORS Considerations for Iframe:**
- AutoAssistPro must allow embedding from techequityconsulting.com
- Add to CORS allowlist
- CSP headers: `frame-ancestors 'self' techequityconsulting.com`

---

## Next Steps

After this analysis, the migration will follow these phases:

### Phase 1: AutoAssistPro Booking Page (Backend)
1. Create standalone booking view at `/booking` or `/embed/booking`
2. Accept query parameters: `clientId`, `sessionId`, `theme`
3. Implement booking form with same API as widget currently uses
4. Style with TechEquity blue/cyan theme
5. Add postMessage communication for confirmation/close
6. Test standalone in browser

### Phase 2: Iframe Integration (TechEquity Frontend)
1. Create `IframeBookingContainer.tsx` component
2. Update `useWidgetBookingIntegration.ts` to open iframe
3. Remove `SchedulingModal.tsx`, `useScheduling.ts`, `useFormData.ts`
4. Update `app/page.tsx` to use iframe instead of modal
5. Test widget → iframe flow

### Phase 3: End-to-End Testing
1. Test booking flow on mobile/tablet/desktop
2. Verify sessionId tracking through entire flow
3. Test edge cases (network failures, user cancellation)
4. Verify admin panel still receives bookings
5. Performance testing (iframe load time)

### Phase 4: Deployment
1. Deploy AutoAssistPro booking page to production
2. Update TechEquity code (remove duplicates)
3. Deploy to staging/preview
4. Smoke test all devices
5. Production deployment
6. Monitor for errors

### Phase 5: Cleanup
1. Remove unused types from `app/types/index.ts`
2. Archive old modal components for reference
3. Update documentation
4. Celebrate! 🎉

---

## Code Reference Locations

### Widget Integration
- **Config:** app/page.tsx:138-151
- **Script Loading:** app/page.tsx:157-165
- **Widget File:** public/widget.js (588KB)

### Custom Scheduling (TO BE REMOVED)
- **Modal Component:** app/components/SchedulingModal.tsx:1-887
  - Mobile variant: lines 40-363
  - Tablet variant: lines 368-611
  - Desktop variant: lines 616-832
- **Scheduling Hook:** app/hooks/useScheduling.ts:1-400
  - API calls: lines 35-116 (slots), 119-201 (booking)
  - Auth: lines 8-22 (getApiKey, getApiBaseUrl)
- **Form Hook:** app/hooks/useFormData.ts:1-523

### Event Handling
- **Widget Events:** app/hooks/useWidgetBookingIntegration.ts:24-46
- **Booking Confirmation:** app/page.tsx:95-97
- **Main Handler:** app/page.tsx:72-103

### Styling & Branding
- **Color Scheme:** app/components/HeroSection.tsx (blue/cyan gradients)
- **Global Styles:** app/globals.css
- **Widget Overrides:** app/widget-overrides.css
- **Layout:** app/layout.tsx

### API Configuration
- **Admin API Config:** app/admin/utils/apiConfig.ts:4-11
- **Widget API Config:** app/hooks/useScheduling.ts:8-22

### Types
- **Form Data:** app/types/index.ts:8-15
- **Slots:** app/types/index.ts:17-27

---

## Testing Requirements

### Pre-Migration Testing (Baseline)
1. ✅ Document current booking flow (Widget → Modal → API)
2. ✅ Capture screenshots of modal on mobile/tablet/desktop
3. ✅ Test session ID flow end-to-end
4. ✅ Verify booking appears in admin panel
5. ✅ Record network requests (API calls, headers)

### During Migration Testing
1. ⚠️ Test iframe loads correctly from AutoAssistPro
2. ⚠️ Verify sessionId passed via URL parameter
3. ⚠️ Test postMessage communication (booking confirmed, close)
4. ⚠️ Verify styling matches TechEquity branding
5. ⚠️ Test on iPhone, Android, tablet, desktop

### Post-Migration Testing
1. ⚠️ Full regression: Widget → Iframe → Booking → Confirmation
2. ⚠️ Verify admin panel shows new bookings
3. ⚠️ Test error scenarios (network failure, timeout)
4. ⚠️ Performance comparison (load times before/after)
5. ⚠️ A/B test conversion rates (old modal vs new iframe)

---

## Success Criteria

The migration will be considered successful when:

1. ✅ **Functionality Preserved**
   - Users can book calls from widget button
   - Bookings appear in admin panel
   - Session IDs tracked correctly

2. ✅ **Code Simplified**
   - Removed ~1,810 lines of duplicated code
   - Single source of truth for booking UI (AutoAssistPro)
   - Easier to maintain and update

3. ✅ **UX Maintained**
   - Booking flow feels seamless
   - No noticeable performance degradation
   - Mobile experience remains excellent

4. ✅ **Branding Intact**
   - Blue/cyan TechEquity theme preserved
   - Professional appearance maintained
   - Consistent with rest of site

5. ✅ **No Regressions**
   - Admin panel works
   - Widget functionality unchanged
   - All events firing correctly

---

## Appendix: Key Insights

### Why TechEquity Duplicated the Code

Looking at the implementation, TechEquity duplicated AutoAssistPro's booking functionality to:
1. Have full control over styling/branding
2. Implement device-responsive variants (mobile wizard vs desktop form)
3. Customize form fields (company, interest fields)
4. Optimize for their specific use case

### What Makes Migration Possible

The migration is viable because:
1. TechEquity only uses standard booking fields
2. Event integration (sessionId) is well-designed
3. API authentication is already using widget config
4. Iframe can be styled to match branding
5. No complex custom logic in booking flow

### Migration Benefits

1. **Maintenance:** No need to sync booking UI with AutoAssistPro updates
2. **Performance:** Smaller JavaScript bundle (remove 1,810 lines)
3. **Reliability:** Single source of truth for booking logic
4. **Scalability:** AutoAssistPro can add features without TechEquity code changes
5. **Security:** API calls happen server-side in AutoAssistPro

---

## MIGRATION UPDATE: Admin Panel (October 26, 2025)

### Admin Panel Migration Complete

**Status:** ✅ COMPLETED

Following the successful booking migration (Oct 25, 2025), TechEquity has now migrated the admin panel to iframe-based architecture.

**Before (Custom Admin Panel):**
- Location: `app/admin/` (104 files, ~6,500 lines)
- Full-featured React admin panel
- 6 tabs: Availability, Bookings, Chat Logs, Settings, Analytics, Profile
- Custom authentication, hooks, components, state management
- Direct API calls to AutoAssistPro backend
- Device-responsive layouts (mobile/tablet/desktop)

**After (iframe Admin Panel):**
- Location: `app/admin/page.tsx` (1 file, ~200 lines)
- Simple iframe embedding AutoAssistPro admin
- URL: `http://localhost:3001/admin` (dev) or `https://autoassistpro.org/admin` (prod)
- Authentication handled by AutoAssistPro
- Loading and error states
- Full-screen professional layout

### Migration Statistics

| Metric | Value |
|--------|-------|
| Files Deleted | 104 |
| Lines Removed | ~6,500 |
| Lines Added | ~200 |
| Code Reduction | 97% |
| Migration Date | Oct 26, 2025 |

### Combined Migration Impact (Booking + Admin)

**Total Code Removed:**
- Booking: 1,810 lines (3 files)
- Admin: 6,500 lines (104 files)
- **Total: 8,310 lines (107 files)**

**Total Code Added:**
- Booking iframe: 148 lines
- Admin iframe: 200 lines
- **Total: 348 lines**

**Net Impact:**
- **7,962 lines removed** (96% reduction)
- TechEquity is now a lightweight frontend that embeds AutoAssistPro features
- All business logic maintained in AutoAssistPro backend

### Benefits of iframe Architecture

1. **Massive Code Reduction:**
   - From 8,310 lines → 348 lines
   - 96% reduction in feature code
   - Easier to maintain, test, and deploy

2. **Single Source of Truth:**
   - Booking logic in AutoAssistPro only
   - Admin logic in AutoAssistPro only
   - No code duplication between clients

3. **Automatic Updates:**
   - AutoAssistPro improvements instantly available
   - No need to update TechEquity code
   - All clients get features simultaneously

4. **Brand Consistency:**
   - Users stay on techequityconsulting.com domain
   - Professional seamless experience
   - No external redirects

5. **Scalability:**
   - Same approach works for all future clients
   - Easy to onboard new businesses
   - Centralized maintenance

### Access Points

**Public Website:**
- Homepage: `www.techequityconsulting.com`
- Widget: Bottom-right corner (embedded AutoAssistPro widget)
- Booking: Widget button → iframe modal

**Admin Panel:**
- URL: `www.techequityconsulting.com/admin`
- Keyboard shortcut: `Ctrl+Shift+A` (preserved from old implementation)
- Full-screen iframe to AutoAssistPro admin
- All features: Availability, Bookings, Chat Logs, Settings, Profile

### Files Modified/Created

**Deleted:**
- `app/admin/` directory (104 files, ~6,500 lines)

**Created:**
- `app/admin/page.tsx` (200 lines - new iframe-based admin)
- `ADMIN_MIGRATION_BACKUP.md` (backup record of deleted files)

**Updated:**
- `TECHEQUITY_MIGRATION_CONTEXT.md` (this document)
- `AUTOASSISTPRO_SYSTEM_CONTEXT.md` (system documentation)

### Architecture Now Complete

TechEquity now has a **fully iframe-based architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│              TechEquity Website (Frontend Only)             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Public Website                                       │  │
│  │  - Marketing pages (Hero, About, Services)          │  │
│  │  - Widget integration (AutoAssistPro chat)          │  │
│  │  - NO booking code (iframe to AutoAssistPro)        │  │
│  │  - NO admin code (iframe to AutoAssistPro)          │  │
│  └─────────────────────────────────────────────────────┘  │
│                              ▲                              │
│  ┌────────────────────────────┴──────────────────────┐    │
│  │ iframe Integrations                               │    │
│  │  - BookingIframe: /booking (148 lines)            │    │
│  │  - AdminIframe: /admin (200 lines)                │    │
│  │  - Both embed AutoAssistPro endpoints             │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Total Feature Code: 348 lines (was 8,658 lines)           │
│  Reduction: 96%                                             │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ All features via iframe
                              │
┌─────────────────────────────┴───────────────────────────────┐
│            AutoAssistPro Backend (Multi-Tenant SaaS)        │
│                                                             │
│  - Serves widget.js                                         │
│  - Provides /booking endpoint                               │
│  - Provides /admin endpoint                                 │
│  - REST API for all operations                              │
│  - PostgreSQL database                                      │
│  - Single source of truth for all features                  │
└─────────────────────────────────────────────────────────────┘
```

**Result:** Clean separation of concerns, minimal client code, maximum maintainability.

---

**End of Migration Context Document**

**Status:** TechEquity migration to iframe-based architecture COMPLETE
**Date:** October 26, 2025
**Next Steps:** Deploy to production, monitor performance, onboard next client
