import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});

export const config = {
  matcher: [
    '/studio/:path*',
    '/gallery/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/generate/:path*',
    '/api/generations/:path*',
    '/api/enhance-prompt/:path*',
    '/api/admin/:path*',
    // NOTE: /api/models is intentionally NOT protected
    // so the home page can load models without auth.
  ],
};
