import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

/**
 * API Interceptor - Routes /api requests to backend server
 * In development: redirects /api/* to http://localhost:3000/api/*
 * In production: keeps relative paths (served from same host)
 */
export const apiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Only intercept API requests (starting with /api)
  if (req.url.startsWith('/api')) {
    // In development, redirect to backend server
    const isDevelopment = !window.location.hostname.includes('prod') && 
                          window.location.hostname === 'localhost';
    
    if (isDevelopment && window.location.port === '4200') {
      // Frontend dev server is on 4200, backend is on 3000
      const backendUrl = `http://localhost:3000${req.url}`;
      req = req.clone({ url: backendUrl });
    }
    // In production, relative URLs will work fine (same host)
  }

  return next(req);
};
