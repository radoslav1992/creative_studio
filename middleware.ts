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
    '/api/generate/:path*',
    '/api/generations/:path*',
    '/api/enhance-prompt/:path*',
    // NOTE: /api/models and /api/admin/* are intentionally NOT protected
    // so the home page can load models without auth, and sync can run freely.
  ],
};
