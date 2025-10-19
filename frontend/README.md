# Exits LMS - Frontend

Angular 17 application with Tailwind CSS for the Exits Loan Management SaaS platform.

## Features

- ✅ **Standalone Components** - Modern Angular architecture
- ✅ **Lazy Loading** - Route-based code splitting
- ✅ **Tailwind CSS** - Utility-first styling with dark mode
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role Guards** - Route protection by role
- ✅ **HTTP Interceptors** - Automatic token injection
- ✅ **Theme Service** - Light/dark mode support
- ✅ **Responsive Design** - Mobile-first approach

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on http://localhost:3000

## Installation

```powershell
npm install
```

## Development

Start the development server:
```powershell
npm start
```

The application will run on `http://localhost:4200`

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── theme.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts
│   │
│   ├── shared/                  # Shared components
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   │
│   ├── modules/                 # Feature modules
│   │   ├── money-loan/
│   │   └── bnpl/
│   │
│   ├── pages/                   # Page components
│   │   ├── landing/
│   │   ├── login/
│   │   ├── super-admin/
│   │   └── tenant/
│   │
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts           # Development config
│   └── environment.prod.ts      # Production config
│
├── styles.scss                  # Global styles with Tailwind
└── index.html
```

## Configuration

### Environment Variables

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Exits LMS',
  appVersion: '1.0.0',
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: '/api',  // Update with your production API URL
  appName: 'Exits LMS',
  appVersion: '1.0.0',
};
```

## Available Scripts

```powershell
npm start           # Start development server (port 4200)
npm run build       # Build for production
npm run watch       # Build and watch for changes
npm test            # Run unit tests
npm run lint        # Lint code
```

## Routing

### Public Routes
- `/` - Landing page
- `/login` - Login page

### Super Admin Routes (Platform Scope)
- `/super-admin/dashboard` - Super Admin dashboard
- `/super-admin/tenants` - Tenant management
- `/super-admin/tenants/create` - Create new tenant
- `/super-admin/tenants/:id` - Tenant details

### Tenant Routes (Tenant Scope)
- `/tenant/dashboard` - Tenant dashboard
- `/tenant/customers` - Customer management (Money-Loan)
- `/tenant/loans` - Loan management (Money-Loan)
- `/tenant/merchants` - Merchant management (BNPL)
- `/tenant/orders` - Order management (BNPL)

## Authentication

### Login Flow
1. User submits credentials on `/login`
2. `AuthService.login()` calls backend API
3. JWT token stored in localStorage
4. User redirected based on role:
   - Platform scope → `/super-admin`
   - Tenant scope → `/tenant`

### Route Protection
```typescript
{
  path: 'super-admin',
  canActivate: [authGuard, roleGuard],
  data: { requiredScope: 'platform' },
  // ...
}
```

### HTTP Interceptor
Automatically adds JWT token to all HTTP requests:
```typescript
Authorization: Bearer <token>
```

## Theming

### Dark Mode
Toggle dark mode using `ThemeService`:
```typescript
constructor(private themeService: ThemeService) {}

toggleTheme() {
  this.themeService.toggleDarkMode();
}
```

### Tailwind Classes
- Use `dark:` prefix for dark mode styles
- Theme preference persists in localStorage
- Automatic system preference detection

### Custom Tailwind Classes
```scss
.btn                 // Base button
.btn-primary         // Primary button
.btn-secondary       // Secondary button
.btn-danger          // Danger button
.input               // Form input
.card                // Card container
.table               // Data table
.badge               // Status badge
```

## Services

### AuthService
```typescript
login(email, password)           // Login user
logout()                         // Logout user
isAuthenticated()                // Check if authenticated
getCurrentUser()                 // Get current user
hasScope(scope)                  // Check user scope
hasModule(moduleName)            // Check enabled module
```

### ThemeService
```typescript
setDarkMode(isDark)              // Set theme
toggleDarkMode()                 // Toggle theme
isDarkMode()                     // Check current theme
```

## Guards

### authGuard
Protects routes requiring authentication:
```typescript
{
  path: 'protected',
  canActivate: [authGuard],
  // ...
}
```

### roleGuard
Protects routes by user role/scope:
```typescript
{
  path: 'super-admin',
  canActivate: [authGuard, roleGuard],
  data: { requiredScope: 'platform' },
  // ...
}
```

## Building for Production

```powershell
npm run build
```

Output will be in `dist/exits-lms-frontend/`

### Production Checklist
- [ ] Update `environment.prod.ts` with production API URL
- [ ] Configure CORS on backend
- [ ] Setup proper SSL/TLS
- [ ] Configure CDN for static assets
- [ ] Enable service worker (optional)
- [ ] Setup error tracking (Sentry, etc.)

## Styling Guide

### Color Palette
```scss
primary:    #2563eb (blue)
secondary:  #64748b (gray)
success:    #10b981 (green)
warning:    #f59e0b (yellow)
danger:     #ef4444 (red)
```

### Responsive Breakpoints
```scss
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Testing

Run unit tests:
```powershell
npm test
```

Run tests with coverage:
```powershell
npm run test:coverage
```

## Common Issues

### Port Already in Use
```powershell
# Change port in angular.json or use:
ng serve --port 4300
```

### API Connection Issues
- Ensure backend is running on http://localhost:3000
- Check CORS configuration in backend
- Verify API URL in environment files

### Build Errors
```powershell
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

## License

MIT
