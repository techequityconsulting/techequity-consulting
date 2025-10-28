# Fix for AutoAssistPro `/booking` Page Deployment Error

## Error
```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/booking"
```

## Problem
The `/booking` page in **AutoAssistPro repository** (github.com/SCDEVBrazil/autoassistpro-frontend) is using `useSearchParams()` without a Suspense boundary, which is required in Next.js 15.

## Solution

### Option 1: Wrap Component in Suspense (Recommended)

In the AutoAssistPro repository, edit `app/booking/page.tsx`:

**Before:**
```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  // ... rest of component
}
```

**After:**
```typescript
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function BookingContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  // ... rest of component
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
```

### Option 2: Use Dynamic Route Parameters Instead

If you want to avoid Suspense, change the booking page to use route parameters:

**Route Structure:**
- Old: `/booking?clientId=xxx&apiKey=xxx`
- New: `/booking/[clientId]/[apiKey]`

**File:** `app/booking/[clientId]/[apiKey]/page.tsx`
```typescript
'use client';

interface BookingPageProps {
  params: {
    clientId: string;
    apiKey: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const { clientId, apiKey } = params;
  // No useSearchParams needed!
}
```

## Steps to Deploy Fix

### If Using Option 1 (Suspense - Easier):

1. **Navigate to AutoAssistPro repository:**
   ```bash
   cd /path/to/autoassistpro-frontend
   ```

2. **Find the booking page:**
   ```bash
   # Should be at:
   # app/booking/page.tsx
   ```

3. **Edit the file:**
   - Import Suspense from React
   - Split component into inner component
   - Wrap inner component in Suspense
   - Add loading fallback

4. **Commit and push:**
   ```bash
   git add app/booking/page.tsx
   git commit -m "Fix: Add Suspense boundary to booking page for Next.js 15"
   git push origin main
   ```

5. **Redeploy on Vercel** (should auto-deploy on push)

### If Using Option 2 (Route Parameters - More Work):

1. Change iframe URLs in TechEquity to match new route structure
2. Update all references to booking page
3. Test thoroughly before deploying

## Recommended Approach

**Use Option 1 (Suspense)** - it's:
- ✅ Simpler (one file change)
- ✅ Backwards compatible (query params still work)
- ✅ Next.js 15 compliant
- ✅ Only takes 5 minutes

## Testing After Fix

After deploying the fix:

1. **Test locally first:**
   ```bash
   cd autoassistpro-frontend
   npm run build
   ```
   Should build without errors.

2. **Test in browser:**
   - Visit: `http://localhost:3001/booking?clientId=test&apiKey=test`
   - Should load without errors
   - Should show loading spinner briefly

3. **Deploy to Vercel:**
   - Push to main branch
   - Vercel auto-deploys
   - Check deployment logs for success

## Related Documentation

- [Next.js Suspense Documentation](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#streaming-with-suspense)
- [useSearchParams() with Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)

---

**Note:** This fix needs to be applied in the **AutoAssistPro repository**, not TechEquity. The TechEquity iframe integration is correct and doesn't need changes.
