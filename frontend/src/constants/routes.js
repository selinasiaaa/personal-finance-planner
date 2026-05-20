// Route paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  CHANGE_PASSWORD: '/change-password',
  DASHBOARD: '/dashboard',
  GOALS: '/',
  INVESTMENTS: '/investments',
  ROI: '/roi',
  PROFILE: '/profile',
}

// Auth routes (visible to non-authenticated users)
export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.CHANGE_PASSWORD,
]

// Page slugs for sidebar navigation
export const PAGE_SLUGS = {
  GOALS: 'goals',
  INVESTMENTS: 'investments',
  ROI: 'roi',
  DASHBOARD: 'dashboard',
  PROFILE: 'profile',
}

// Route to page slug mapping
export const ROUTE_PAGE_MAP = {
  [ROUTES.GOALS]: PAGE_SLUGS.GOALS,
  [ROUTES.DASHBOARD]: PAGE_SLUGS.DASHBOARD,
  [ROUTES.INVESTMENTS]: PAGE_SLUGS.INVESTMENTS,
  [ROUTES.ROI]: PAGE_SLUGS.ROI,
  [ROUTES.PROFILE]: PAGE_SLUGS.PROFILE,
}
