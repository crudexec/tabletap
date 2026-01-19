import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                         nextUrl.pathname.startsWith('/register');
      const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
      // Match /{company}/table/{id} pattern for public table pages
      const isPublicTablePage = /^\/[^/]+\/table\/\d+$/.test(nextUrl.pathname);

      // Allow auth API routes, auth pages, and public table pages
      if (isApiAuth || isPublicTablePage) return true;

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }

      // Protect all other routes
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
