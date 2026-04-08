/**
 * Reusable sidebar component
 * Dynamically creates and injects the sidebar into the page
 */

function createSidebar(currentPage = 'goals') {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userName = user ? user.name : 'Guest';
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'GU';
  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="bi bi-bar-chart-fill"></i></div>
        <span class="logo-text">WealthTrack</span>
      </div>
      <nav class="sidebar-nav">
        ${['login', 'register', 'forgot-password'].includes(currentPage) ? '' : `
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
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">${userInitials}</div>
          <div>
            <p class="user-name">${userName}</p>
            <p class="user-role">Premium Plan</p>
          </div>
        </div>
      </div>
    </aside>
  `;
  return sidebarHTML;
}

function injectSidebar(currentPage = 'goals') {
  const body = document.body;
  const sidebarMarkup = createSidebar(currentPage);
  body.insertAdjacentHTML('afterbegin', sidebarMarkup);
}

// Auto-inject on DOMContentLoaded if no sidebar exists yet
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('aside.sidebar') && document.body.dataset.page) {
    injectSidebar(document.body.dataset.page);
  }
});
