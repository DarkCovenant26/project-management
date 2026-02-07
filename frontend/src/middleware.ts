import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access')?.value; // Or check local storage on client, but middleware is server-side.
    // NOTE: Accessing localStorage is not possible in middleware.
    // Auth relies on cookies or headers. Assuming we might migrate to cookies or handle client-side redirect for now.
    // BUT since we are using localStorage in api.ts, this middleware check might be limited to checking for a cookie if we set one,
    // OR we rely on client-side protection.
    //
    // However, the requirement is "Implment Auth Middleware".
    // If we only use localStorage, middleware cannot see it.
    // We should probably rely on a cookie 'session' or 'access' token if available.
    //
    // FOR NOW: We will implement a basic check if we can, but since the current auth uses localStorage (as seen in sidebar/api.ts),
    // we might need to rely on client-side checks OR migrate to cookies.
    //
    // Let's implement a simple pass-through or a check if a cookie exists (if we add cookie logic later).
    // For this specific task "FE-017", if we stick to localStorage, we can't fully protect routes via middleware.
    //
    // STRATEGY:
    // 1. We will assume for a robust app we SHOULD use cookies.
    // 2. But to not break existing localStorage flow immediately without backend changes,
    //    we might need to skip strict token validation in middleware if we don't have cookies yet.
    //
    // WAIT. `FE-017` acceptance criteria says "Match /dashboard/:path*".
    // If I can't read localStorage, I can't protect it server-side.
    //
    // LET'S LOOK AT `api.ts`. It uses `localStorage.getItem('access')`.
    // So middleware is effectively useless for auth *enforcement* content-wise unless we change to cookies.
    //
    // PROPOSAL: I will implement the middleware structure but maybe comment out strict redirect until we have cookies,
    // OR I will assume we might start setting a cookie.
    //
    // ACTUALLY, usually in these tasks, I should probably stick to what's possible.
    // If I can't use middleware effectively, I should use a Layout wrapper/HOC for protection.
    // BUT the task specifically asks for "Next.js Middleware".
    //
    // Maybe the user *intends* for us to switch to cookies? Or they just want the *file* ready.
    // I will write the middleware to check for a cookie named 'access' or 'sessionid'.
    // If it's missing, I'll redirect.
    // To make this work, the login page MUST set a cookie.
    // I'll check `src/app/(auth)/login/page.tsx` first.

    // Let's check `login` page first before writing this.
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/projects/:path*', '/tasks/:path*'],
};
