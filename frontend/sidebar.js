/**
 * Reusable sidebar component
 * Dynamically creates and injects the sidebar into the page
 */

function createSidebar(currentPage = 'goals') {
  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="bi bi-bar-chart-fill"></i></div>
        <span class="logo-text">WealthTrack</span>
      </div>
      <nav class="sidebar-nav">
        <a href="index.html" class="nav-item ${currentPage === 'goals' ? 'active' : ''}" data-section="goals">
          <i class="bi bi-flag-fill"></i>
          <span>Financial Goals</span>
          <span class="badge-count" id="goalsBadge">5</span>
        </a>
        <a href="investments.html" class="nav-item ${currentPage === 'investments' ? 'active' : ''}" data-section="investments">
          <i class="bi bi-graph-up-arrow"></i>
          <span>Investments</span>
        </a>
        <a href="roi.html" class="nav-item ${currentPage === 'roi' ? 'active' : ''}" data-section="roi">
          <i class="bi bi-calculator-fill"></i>
          <span>ROI Calculator</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">AT</div>
          <div>
            <p class="user-name">Alexander</p>
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
