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
  ],
};
