// Sidebar navigation items
export const NAV_ITEMS = [
  {
    page: 'goals',
    label: 'Financial Goals',
    icon: 'bi-flag-fill',
    path: '/',
  },
  {
    page: 'investments',
    label: 'Investments',
    icon: 'bi-graph-up-arrow',
    path: '/investments',
  },
  {
    page: 'roi',
    label: 'ROI Calculator',
    icon: 'bi-calculator-fill',
    path: '/roi',
  },
  {
    page: 'dashboard',
    label: 'Market Insights',
    icon: 'bi-bar-chart-line-fill',
    path: '/dashboard',
  },
]

// Risk profiles for investments
export const RISK_PROFILES = [
  { value: 'conservative', label: 'Conservative', icon: 'bi-shield-check', color: '#3b6eff' },
  { value: 'moderate', label: 'Moderate', icon: 'bi-balance-scale', color: '#f97316' },
  { value: 'aggressive', label: 'Aggressive', icon: 'bi-lightning-charge', color: '#ef4444' },
]
