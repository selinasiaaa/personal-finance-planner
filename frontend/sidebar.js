/**
 * Reusable sidebar component
 * Dynamically creates and injects the sidebar into the page
 */

function createSidebar(currentPage = 'goals') {
  const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || 'Guest';
  const userInitials = user?.name
    ? user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
    : 'GU';
  const isAuthPage = ['login', 'register', 'forgot-password'].includes(currentPage);

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="bi bi-bar-chart-fill"></i></div>
        <span class="logo-text">WealthTrack</span>
      </div>
      <nav class="sidebar-nav">
        ${isAuthPage ? '' : `
        <a href="index.html" class="nav-item ${currentPage === 'goals' ? 'active' : ''}" data-section="goals">
          <i class="bi bi-flag-fill"></i>
          <span>Financial Goals</span>
        </a>
        <a href="investments.html" class="nav-item ${currentPage === 'investments' ? 'active' : ''}" data-section="investments">
          <i class="bi bi-graph-up-arrow"></i>
          <span>Investments</span>
        </a>
        <a href="roi.html" class="nav-item ${currentPage === 'roi' ? 'active' : ''}" data-section="roi">
          <i class="bi bi-calculator-fill"></i>
          <span>ROI Calculator</span>
        </a>
        <a href="profile.html" class="nav-item ${currentPage === 'profile' ? 'active' : ''}" data-section="profile">
          <i class="bi bi-person-fill"></i>
          <span>Profile</span>
        </a>
        <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}" data-section="dashboard">
          <i class="bi bi-bar-chart-line-fill"></i>
          <span>Market Insights</span>
        </a>
        `}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">${userInitials}</div>
          <div>
            <p class="user-name">${userName}</p>
            <p class="user-role">${user ? 'Active Session' : 'Guest Access'}</p>
          </div>
        </div>
        ${!isAuthPage && user ? `
          <button type="button" class="sidebar-logout" id="sidebarLogoutBtn">
            <i class="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        ` : ''}
      </div>
    </aside>
  `;
  return sidebarHTML;
}

function injectSidebar(currentPage = 'goals') {
  if (['login', 'register', 'forgot-password'].includes(currentPage)) return;

  const body = document.body;
  const sidebarMarkup = createSidebar(currentPage);
  body.insertAdjacentHTML('afterbegin', sidebarMarkup);
}

document.addEventListener('click', event => {
  const logoutBtn = event.target.closest('#sidebarLogoutBtn');
  if (logoutBtn) {
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
});

// Auto-inject on DOMContentLoaded if no sidebar exists yet
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = document.body.dataset.page;
  if (!currentPage || ['login', 'register', 'forgot-password'].includes(currentPage)) {
    return;
  }

  if (!document.querySelector('aside.sidebar')) {
    injectSidebar(currentPage);
  }
});
