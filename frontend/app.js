/**
 * WealthTrack page logic
 * - index.html: goals
 * - investments.html: investments
 * - roi.html: ROI calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'goals';
  initNavigation(page);
  if (page === 'goals') initGoalsPage();
  if (page === 'investments') initInvestmentsPage();
  if (page === 'roi') initRoiPage();
  if (page === 'login') initLoginPage();
  if (page === 'register') initRegisterPage();
  if (page === 'forgot-password') initForgotPasswordPage();
  if (page === 'profile') initProfilePage();
  if (page === 'dashboard') initDashboardPage();
});

function initNavigation(page) {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === page);
  });
}

let editingCard = null;
const API_BASE = 'http://localhost:3001';

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function setStoredUser(user, remember = true) {
  const serialized = JSON.stringify(user);
  if (remember) {
    localStorage.setItem('user', serialized);
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('user', serialized);
    localStorage.removeItem('user');
  }
}

function clearStoredUser() {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

async function apiRequest(path, options = {}) {
  const config = {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  };

  const response = await fetch(`${API_BASE}${path}`, config);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.');
  }

  return data;
}

function requireAuthenticatedUser() {
  const user = getStoredUser();
  if (!user?.email) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function initGoalsPage() {
  const user = getStoredUser();
  if (!user?.email) {
    window.location.href = 'login.html';
    return;
  }
  // Proceed with goals if logged in
  const filterTabs = document.querySelectorAll('#goalFilterTabs .filter-tab');
  const goalsGrid = document.getElementById('goalsGrid');

  function filterGoals(filter) {
    document.querySelectorAll('#goalsGrid .goal-card-wrapper').forEach(w => {
      const status = w.dataset.status;
      let show = false;
      if (filter === 'all') show = true;
      else if (status === 'create') show = true;
      else if (filter === status) show = true;
      w.style.display = show ? '' : 'none';
      if (show) {
        w.style.animation = 'none';
        void w.offsetHeight;
        w.style.animation = '';
      }
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterGoals(tab.dataset.filter);
    });
  });

  const goalSearch = document.getElementById('goalSearch');
  goalSearch?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#goalsGrid .goal-card-wrapper').forEach(w => {
      if (w.dataset.status === 'create') return;
      const title = w.querySelector('.goal-title')?.textContent.toLowerCase() || '';
      const desc = w.querySelector('.goal-desc')?.textContent.toLowerCase() || '';
      w.style.display = (!q || title.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });

  goalsGrid?.addEventListener('click', e => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
      const wrapper = deleteBtn.closest('.goal-card-wrapper');
      const name = wrapper?.querySelector('.goal-title')?.textContent || 'this goal';
      if (wrapper && confirm(`Delete "${name}"?`)) {
        wrapper.style.transition = 'opacity .25s, transform .25s';
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'scale(.95)';
        setTimeout(() => {
          wrapper.remove();
        }, 250);
      }
      return;
    }

    const aiBtn = e.target.closest('.ai-btn');
    if (aiBtn) {
      const modal = new bootstrap.Modal(document.getElementById('aiAdvisoryModal'));
      modal.show();
      return;
    }

    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const wrapper = editBtn.closest('.goal-card-wrapper');
      openEditGoalModal(wrapper);
    }
  });

  function parseCurrency(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    return Number(cleaned) || 0;
  }

  function computeProgress(saved, target) {
    const savedValue = parseCurrency(saved);
    const targetValue = parseCurrency(target);
    if (!targetValue) return 0;
    return Math.min(100, Math.round((savedValue / targetValue) * 100));
  }

  function openEditGoalModal(wrapper) {
    if (!wrapper) return;
    editingCard = wrapper;
    const title = wrapper.querySelector('.goal-title')?.textContent || '';
    const desc = wrapper.querySelector('.goal-desc')?.textContent || '';
    const amounts = wrapper.querySelector('.goal-amounts')?.textContent || '';
    const savedMatch = amounts.match(/RM\s*([\d,]+)/);
    const targetMatch = amounts.match(/\/\s*RM\s*([\d,]+)/);
    const monthlyText = wrapper.querySelector('.meta-monthly')?.textContent || '';
    const monthlyMatch = monthlyText.match(/RM\s*([\d,]+)/);
    const dateText = wrapper.querySelector('.meta-row span')?.textContent || '';
    const dateLabel = dateText.replace(/^.*(Target:|Completed:)\s*/, '').trim();
    const icon = wrapper.querySelector('.goal-icon')?.textContent || '🏠';
    const statusKey = wrapper.dataset.status || 'on-track';
    const statusBadge = wrapper.querySelector('.status-badge');

    document.getElementById('cgName').value = title;
    document.getElementById('cgDesc').value = desc === 'No description provided.' ? '' : desc;
    document.getElementById('cgTarget').value = targetMatch ? `RM ${targetMatch[1].replace(/,/g, '')}` : '';
    document.getElementById('cgSavings').value = savedMatch ? `RM ${savedMatch[1].replace(/,/g, '')}` : '';
    document.getElementById('cgMonthly').value = monthlyMatch ? `RM ${monthlyMatch[1].replace(/,/g, '')}` : '';

    const dateInput = document.getElementById('cgDate');
    const months = {Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
    const [mon, year] = dateLabel.split(' ');
    dateInput.value = months[mon] && year ? `${year}-${months[mon]}` : '';

    document.querySelectorAll('#categoryDropdown .custom-option').forEach(opt => {
      const iconText = opt.dataset.icon || '';
      if (iconText === icon) {
        opt.classList.add('selected');
        document.getElementById('categoryIcon').textContent = iconText;
        document.getElementById('categoryLabel').textContent = opt.textContent.replace(iconText, '').trim();
      } else {
        opt.classList.remove('selected');
      }
    });

    document.getElementById('saveGoalBtn').textContent = 'Update Goal';
    document.getElementById('createGoalModalTitle').textContent = 'Update Goal';
    document.getElementById('createGoalModalSub').textContent = 'Edit your goal details and save changes.';
    if (statusBadge) {
      document.getElementById('createGoalModal').dataset.editingStatus = statusKey;
    }
    document.getElementById('createGoalModalTitle').textContent = 'Update Goal';
    document.getElementById('createGoalModalSub').textContent = 'Edit your goal details and save changes.';
    new bootstrap.Modal(document.getElementById('createGoalModal')).show();
  }

  initCategoryDropdown();
  initCreateGoalModal();
  initAiAdvisoryModal();
}

function initCategoryDropdown() {
  const trigger = document.getElementById('categoryTrigger');
  const dropdown = document.getElementById('categoryDropdown');
  const catIcon = document.getElementById('categoryIcon');
  const catLabel = document.getElementById('categoryLabel');
  if (!trigger || !dropdown || !catIcon || !catLabel) return;
  trigger.addEventListener('click', () => dropdown.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!e.target.closest('#categoryWrapper')) dropdown.classList.remove('open');
  });
  dropdown.querySelectorAll('.custom-option').forEach(opt => {
    opt.addEventListener('click', () => {
      dropdown.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      catIcon.textContent = opt.dataset.icon || '🎯';
      catLabel.textContent = opt.textContent.replace(opt.dataset.icon || '', '').trim();
      dropdown.classList.remove('open');
    });
  });
}

function initCreateGoalModal() {
  const saveGoalBtn = document.getElementById('saveGoalBtn');
  const goalsGrid = document.getElementById('goalsGrid');
  const createCard = document.querySelector('[data-status="create"]');
  if (!saveGoalBtn || !goalsGrid || !createCard) return;

  saveGoalBtn.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const name = document.getElementById('cgName')?.value.trim();
    if (!name) { alert('Please enter a goal name.'); return; }
    const desc = document.getElementById('cgDesc')?.value.trim();
    const target = document.getElementById('cgTarget')?.value.trim() || '0';
    const savings = document.getElementById('cgSavings')?.value.trim() || '0';
    const monthly = document.getElementById('cgMonthly')?.value.trim() || '0';
    const dateVal = document.getElementById('cgDate')?.value;
    const icon = document.getElementById('categoryIcon')?.textContent || '🎯';
    let dateLabel = 'TBD';
    if (dateVal) {
      const [yr, mo] = dateVal.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateLabel = `${months[parseInt(mo, 10) - 1]} ${yr}`;
    }
    const progressPercent = computeProgress(savings, target);

    if (editingCard) {
      updateGoalCard(editingCard, { icon, name, desc, target, savings, dateLabel, monthly, progressPercent });
      editingCard = null;
      saveGoalBtn.textContent = 'Save Goal';
    } else {
      const newWrapper = document.createElement('div');
      newWrapper.className = 'col-12 col-md-6 col-xl-4 goal-card-wrapper';
      newWrapper.dataset.status = 'on-track';
      newWrapper.innerHTML = `\n      <div class="goal-card">\n        <div class="goal-card-top">\n          <span class="goal-icon">${icon}</span>\n          <span class="status-badge on-track">On Track</span>\n        </div>\n        <h5 class="goal-title">${esc(name)}</h5>\n        <p class="goal-desc">${esc(desc) || 'No description provided.'}</p>\n        <div class="progress goal-progress"><div class="progress-bar" style="width:${progressPercent}%"></div></div>\n        <p class="goal-amounts"><strong>RM ${esc(savings)}</strong> <span>/ ${esc(target)}</span></p>\n        <div class="goal-meta">\n          <div class="meta-row">\n            <span><i class="bi bi-calendar3"></i> Target: ${dateLabel}</span>\n            <div class="goal-actions">\n              <button type="button" class="action-btn edit-btn"><i class="bi bi-pencil-square"></i></button>\n              <button type="button" class="action-btn delete-btn"><i class="bi bi-trash3"></i></button>\n            </div>\n          </div>\n          <span class="meta-monthly"><i class="bi bi-coin"></i> ${esc(monthly)} / month</span>\n        </div>\n      </div>`;
      goalsGrid.insertBefore(newWrapper, createCard);
    }

    const modalElement = document.getElementById('createGoalModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
    ['cgName','cgDesc','cgTarget','cgSavings','cgMonthly','cgDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('categoryIcon').textContent = '🏠';
    document.getElementById('categoryLabel').textContent = 'Home';
    document.querySelectorAll('#categoryDropdown .custom-option').forEach((opt, index) => {
      opt.classList.toggle('selected', index === 0);
    });
  });

  function resetCreateGoalForm() {
    ['cgName','cgDesc','cgTarget','cgSavings','cgMonthly','cgDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('categoryIcon').textContent = '🏠';
    document.getElementById('categoryLabel').textContent = 'Home';
    document.querySelectorAll('#categoryDropdown .custom-option').forEach((opt, index) => {
      opt.classList.toggle('selected', index === 0);
    });
    saveGoalBtn.textContent = 'Save Goal';
    document.getElementById('createGoalModalTitle').textContent = 'Create New Goal';
    document.getElementById('createGoalModalSub').textContent = 'Define your financial goal and start tracking your progress.';
    editingCard = null;
  }

  document.getElementById('createGoalModal')?.addEventListener('show.bs.modal', () => {
    if (!editingCard) resetCreateGoalForm();
  });

  document.getElementById('createGoalModal')?.addEventListener('hidden.bs.modal', () => {
    resetCreateGoalForm();
  });
}

function updateGoalCard(wrapper, data) {
  if (!wrapper) return;
  wrapper.querySelector('.goal-icon').textContent = data.icon;
  wrapper.querySelector('.goal-title').textContent = data.name;
  wrapper.querySelector('.goal-desc').textContent = data.desc || 'No description provided.';
  wrapper.querySelector('.goal-amounts strong').textContent = `RM ${data.savings}`;
  if (data.status) {
    wrapper.dataset.status = data.status;
    const badge = wrapper.querySelector('.status-badge');
    if (badge) {
      badge.className = `status-badge ${data.status}`;
      badge.textContent = data.status === 'completed' ? 'Completed' : data.status === 'at-risk' ? 'At Risk' : data.status === 'high-risk' ? 'High Risk' : 'On Track';
    }
  }
  wrapper.querySelector('.goal-amounts span').textContent = `/ ${data.target}`;
  wrapper.querySelector('.goal-meta .meta-row span').innerHTML = `<i class="bi bi-calendar3"></i> Target: ${data.dateLabel}`;
  wrapper.querySelector('.meta-monthly').textContent = `RM ${data.monthly} / month`;
  wrapper.querySelector('.progress-bar').style.width = `${data.progressPercent}%`;
}

function initAiAdvisoryModal() {
  const optionA = document.getElementById('optionA');
  const optionB = document.getElementById('optionB');
  const applyBtn = document.getElementById('applyOptionBtn');
  let selectedOption = null;
  if (!optionA || !optionB || !applyBtn) return;
  function selectOption(card, key) {
    [optionA, optionB].forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedOption = key;
    applyBtn.disabled = false;
    applyBtn.classList.add('ready');
    applyBtn.textContent = `Apply Option ${key}`;
  }
  optionA.addEventListener('click', () => selectOption(optionA, 'A'));
  optionB.addEventListener('click', () => selectOption(optionB, 'B'));
  applyBtn.addEventListener('click', () => {
    if (!selectedOption) return;
    alert(`Option ${selectedOption} applied! Monthly target has been updated.`);
    bootstrap.Modal.getInstance(document.getElementById('aiAdvisoryModal'))?.hide();
  });
  document.getElementById('aiAdvisoryModal')?.addEventListener('hidden.bs.modal', () => {
    [optionA, optionB].forEach(c => c.classList.remove('selected'));
    selectedOption = null;
    applyBtn.disabled = true;
    applyBtn.classList.remove('ready');
    applyBtn.textContent = 'Apply Selected Option';
  });
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function initInvestmentsPage() {
  const user = requireAuthenticatedUser();
  if (!user) return;

  const RISK_DATA = {
    conservative: {
      bannerGrad: 'linear-gradient(135deg, #2e7d32, #4caf50)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● LOW RISK',
      title: 'Conservative Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '3–5%',
      allocation: [
        { label: 'Fixed Deposit / ASB — 50%', pct: 50, color: '#1b5e20' },
        { label: 'Sukuk / Bonds — 30%', pct: 30, color: '#4caf50' },
        { label: 'Money Market — 20%', pct: 20, color: '#a5d6a7' },
      ],
      instruments: ['ASB (Amanah Saham)', 'Sukuk', 'Fixed Deposit', 'Money Market Fund'],
      instrColor: { border: '#4caf50', text: '#2e7d32', bg: '#f1f8e9' },
      goals: ['🚨 Emergency Fund (3–6 months expenses)', '✈️ Travel Fund (1–2 years)', '🎓 Education Savings (short-term)'],
      quote: 'Capital safety is your priority. Keep losses minimal and grow your savings steadily. Ideal if you need the money within 1–3 years.',
      quoteColor: '#2e7d32', quoteBg: '#f1f8e9',
    },
    balanced: {
      bannerGrad: 'linear-gradient(135deg, #1565c0, #42a5f5)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● MEDIUM RISK',
      title: 'Balanced Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '6–10%',
      allocation: [
        { label: 'ETFs / Unit Trusts — 40%', pct: 40, color: '#1565c0' },
        { label: 'Blue-chip Stocks — 35%', pct: 35, color: '#42a5f5' },
        { label: 'Bonds / Sukuk — 25%', pct: 25, color: '#bbdefb' },
      ],
      instruments: ['Bursa Malaysia ETFs', 'Sukuk', 'Blue-chip Stocks', 'Unit Trusts'],
      instrColor: { border: '#42a5f5', text: '#1565c0', bg: '#e3f2fd' },
      goals: ['🏠 House Down Payment (3–7 years)', '💍 Wedding Fund', '📈 Wealth Building (medium-term)'],
      quote: 'Balance growth with stability. Diversify across stocks and bonds. Review your portfolio every 6 months and stay patient through market dips.',
      quoteColor: '#1565c0', quoteBg: '#e3f2fd',
    },
    aggressive: {
      bannerGrad: 'linear-gradient(135deg, #b71c1c, #ef5350)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● HIGH RISK',
      title: 'Aggressive Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '10–20%+',
      allocation: [
        { label: 'Growth Stocks — 60%', pct: 60, color: '#c62828' },
        { label: 'REITs / Sector Funds — 25%', pct: 25, color: '#ef5350' },
        { label: 'Crypto / Alternative — 15%', pct: 15, color: '#ffcdd2' },
      ],
      instruments: ['Bursa Growth Stocks', 'Sector ETFs', 'REITs (M-REITs)', 'Crypto (small %)'],
      instrColor: { border: '#ef5350', text: '#b71c1c', bg: '#ffebee' },
      goals: ['⛱️ Early Retirement (10–20 years)', '🤝 Business Capital Growth', '📈 Aggressive Wealth Creation'],
      quote: 'High potential, high volatility. Only invest money you don\'t need for 5+ years. Never invest more than you can afford to lose.',
      quoteColor: '#b71c1c', quoteBg: '#ffebee',
    },
  };

  function renderRisk(key) {
    const d = RISK_DATA[key];
    const riskContent = document.getElementById('riskContent');
    if (!d || !riskContent) return;
    const allocBarHTML = d.allocation.map(a =>
      `<div class="alloc-segment" style="width:${a.pct}%;background:${a.color}"></div>`
    ).join('');
    const allocItemsHTML = d.allocation.map(a =>
      `<div class="alloc-item"><span class="alloc-dot" style="background:${a.color}"></span>${a.label}</div>`
    ).join('');
    const instrHTML = d.instruments.map(i =>
      `<span class="instrument-tag" style="border-color:${d.instrColor.border};color:${d.instrColor.text};background:${d.instrColor.bg}">${i}</span>`
    ).join('');
    const goalsHTML = d.goals.map(g =>
      `<div class="suitable-item">${g}</div>`
    ).join('');
    riskContent.innerHTML = `
      <div class="risk-plan-banner mb-4" style="background:${d.bannerGrad}">
        <div class="risk-plan-left">
          <div class="risk-plan-tag" style="background:${d.tagBg};color:${d.tagColor}">${d.tagText}</div>
          <div class="risk-plan-title">${d.title}</div>
        </div>
        <div class="risk-plan-right">
          <div class="risk-plan-return-label">${d.returnLabel}</div>
          <div class="risk-plan-return">${d.returnVal}</div>
          <div class="risk-plan-per">per year</div>
        </div>
      </div>
      <div class="row g-3 mb-3">
        <div class="col-12 col-md-6">
          <div class="inv-info-card">
            <p class="inv-info-title">Asset Allocation</p>
            <div class="alloc-bar mb-2">${allocBarHTML}</div>
            ${allocItemsHTML}
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="inv-info-card">
            <p class="inv-info-title">Recommended Instruments</p>
            <div class="instrument-tags">${instrHTML}</div>
          </div>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="inv-info-card">
            <p class="inv-info-title">Suitable Goals</p>
            ${goalsHTML}
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="inv-quote" style="border-color:${d.quoteColor};background:${d.quoteBg};color:${d.quoteColor}">
            "${d.quote}"
          </div>
        </div>
      </div>`;
  }

  const riskTabs = document.querySelectorAll('#riskTabs .risk-tab');
  if (!riskTabs.length) return;
  riskTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      riskTabs.forEach(t => { t.classList.remove('active', 'conservative', 'balanced', 'aggressive'); });
      tab.classList.add('active', tab.dataset.risk);
      renderRisk(tab.dataset.risk);
    });
  });
  const firstRiskTab = document.querySelector('#riskTabs .risk-tab');
  if (firstRiskTab) {
    firstRiskTab.classList.add('active', 'conservative');
    renderRisk('conservative');
  }

  const API_BASE_URL = 'http://localhost:3001';
  const GOALS_LIST = [
    { id: 'goal-1', name: 'Dream Home Down Payment', saved: 88400, target: 130000, status: 'on-track' },
    { id: 'goal-2', name: 'Personal Savings Fund', saved: 44000, target: 100000, status: 'on-track' },
    { id: 'goal-3', name: 'Emergency Fund', saved: 16500, target: 30000, status: 'at-risk' },
    { id: 'goal-4', name: 'Travel Fund', saved: 16400, target: 20000, status: 'on-track' },
    { id: 'goal-5', name: 'Early Retirement Fund', saved: 210000, target: 1000000, status: 'high-risk' },
    { id: 'goal-6', name: 'Japan Travel Fund', saved: 5500, target: 5500, status: 'completed' },
    { id: 'goal-7', name: 'Laptop Upgrade Fund', saved: 4000, target: 4000, status: 'completed' },
  ];

  let selectedPortfolio = 'conservative';
  let selectedGoalId = null;
  let isConfirmLoading = false;

  const selectGoalModal = new bootstrap.Modal(document.getElementById('selectGoalModal'));
  const confirmPortfolioModal = new bootstrap.Modal(document.getElementById('confirmPortfolioModal'));
  const portfolioToast = new bootstrap.Toast(document.getElementById('portfolioToast'));
  const goalOptionsList = document.getElementById('goalOptionsList');
  const goalSelectContinueBtn = document.getElementById('goalSelectContinueBtn');
  const confirmPortfolioGoal = document.getElementById('confirmPortfolioGoal');
  const confirmPortfolioRisk = document.getElementById('confirmPortfolioRisk');
  const confirmPortfolioExpected = document.getElementById('confirmPortfolioExpected');
  const confirmPortfolioError = document.getElementById('confirmPortfolioError');
  const confirmBackBtn = document.getElementById('confirmBackBtn');
  const confirmApplyBtn = document.getElementById('confirmApplyBtn');

  function formatCurrency(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function getStatusLabel(status) {
    if (status === 'completed') return 'Completed';
    if (status === 'high-risk') return 'High Risk';
    if (status === 'at-risk') return 'At Risk';
    return 'On Track';
  }

  function renderGoalOptions() {
    if (!goalOptionsList) return;
    const availableGoals = GOALS_LIST.filter(goal => goal.status !== 'completed');
    goalOptionsList.innerHTML = availableGoals.map(goal => `
      <label class="goal-select-card ${selectedGoalId === goal.id ? 'selected' : ''}" for="goal-${goal.id}">
        <input type="radio" id="goal-${goal.id}" name="selectedGoal" class="goal-select-input" value="${goal.id}" ${selectedGoalId === goal.id ? 'checked' : ''} />
        <span class="goal-select-radio"></span>
        <div class="goal-select-info">
          <span class="goal-select-name">${goal.name}</span>
          <span class="goal-select-meta">RM ${formatCurrency(goal.saved)} / RM ${formatCurrency(goal.target)}</span>
        </div>
        <span class="status-badge ${goal.status}">${getStatusLabel(goal.status)}</span>
      </label>
    `).join('');

    goalOptionsList.querySelectorAll('.goal-select-input').forEach(input => {
      input.addEventListener('change', e => {
        selectedGoalId = e.target.value;
        renderGoalOptions();
        updateContinueState();
      });
    });
  }

  function updateContinueState() {
    if (!goalSelectContinueBtn) return;
    goalSelectContinueBtn.disabled = !selectedGoalId;
  }

  function resetSelectionState() {
    selectedGoalId = null;
    selectedPortfolio = (document.querySelector('#riskTabs .risk-tab.active')?.dataset.risk) || 'conservative';
    renderGoalOptions();
    updateContinueState();
    if (confirmPortfolioError) confirmPortfolioError.style.display = 'none';
  }

  function showConfirmationModal() {
    const selectedGoal = GOALS_LIST.find(g => g.id === selectedGoalId);
    if (!selectedGoal) return;
    confirmPortfolioRisk.textContent = selectedPortfolio.charAt(0).toUpperCase() + selectedPortfolio.slice(1);
    confirmPortfolioExpected.textContent = RISK_DATA[selectedPortfolio].returnVal;
    confirmPortfolioGoal.textContent = `${selectedGoal.name} — RM ${formatCurrency(selectedGoal.saved)} / RM ${formatCurrency(selectedGoal.target)}`;
    confirmPortfolioError.style.display = 'none';
    confirmPortfolioModal.show();
  }

  function setConfirmLoading(loading) {
    isConfirmLoading = loading;
    if (confirmApplyBtn) {
      confirmApplyBtn.disabled = loading;
      confirmApplyBtn.textContent = loading ? 'Applying...' : 'Confirm';
    }
    if (confirmBackBtn) confirmBackBtn.disabled = loading;
  }

  async function applyPortfolioToGoal() {
    if (!selectedGoalId) return;
    setConfirmLoading(true);
    const endpoint = `${API_BASE_URL}/api/goals/${selectedGoalId}/apply-portfolio`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioType: selectedPortfolio }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || 'Unable to apply portfolio.');
      }

      portfolioToast.show();
      confirmPortfolioModal.hide();
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } catch (err) {
      if (confirmPortfolioError) {
        confirmPortfolioError.textContent = err.message || 'Failed to apply portfolio. Please try again.';
        confirmPortfolioError.style.display = 'block';
      }
    } finally {
      setConfirmLoading(false);
    }
  }

  renderGoalOptions();
  updateContinueState();

  goalSelectContinueBtn?.addEventListener('click', () => {
    selectGoalModal.hide();
    showConfirmationModal();
  });

  confirmBackBtn?.addEventListener('click', () => {
    confirmPortfolioModal.hide();
    selectGoalModal.show();
  });

  confirmApplyBtn?.addEventListener('click', applyPortfolioToGoal);

  document.getElementById('applyPortfolioBtn')?.addEventListener('click', () => {
    selectedPortfolio = document.querySelector('#riskTabs .risk-tab.active')?.dataset.risk || 'conservative';
    resetSelectionState();
    selectGoalModal.show();
  });
}

function initRoiPage() {
  const user = requireAuthenticatedUser();
  if (!user) return;

  let roiMode = 'compound';
  let growthChart = null;
  const modeBanner = document.getElementById('modeBanner');
  const modeBannerStrong = document.getElementById('modeBannerStrong');
  const modeBannerText = document.getElementById('modeBannerText');
  const paramBadge = document.getElementById('paramBadge');
  const resultBadge = document.getElementById('resultBadge');
  const scenarioBadge = document.getElementById('scenarioBadge');
  const calcBtnText = document.getElementById('calcBtnText');
  const calcBtn = document.getElementById('calculateBtn');
  const monthlyField = document.getElementById('monthlyField');
  const monthlyTag = document.getElementById('monthlyTag');
  const compoundHint = document.getElementById('compoundHint');
  const switchModeLink = document.getElementById('switchModeLink');

  function updateRoiModeUI() {
    document.querySelectorAll('.roi-mode-btn').forEach(b => {
      b.classList.remove('active','compound-active','simple-active');
      if (b.dataset.mode === roiMode) {
        b.classList.add('active', roiMode === 'compound' ? 'compound-active' : 'simple-active');
      }
    });
    const isCompound = roiMode === 'compound';
    if (modeBanner) modeBanner.className = `mode-banner mb-4 ${isCompound ? 'compound-banner' : 'simple-banner'}`;
    if (modeBannerStrong) modeBannerStrong.textContent = isCompound ? 'Compound mode active' : 'Simple mode active';
    if (modeBannerText) modeBannerText.textContent = isCompound
      ? ' — interest is reinvested each month and added to your balance.'
      : ' — interest is calculated only on the initial investment and does not compound.';
    [paramBadge, resultBadge, scenarioBadge].forEach(b => {
      if (!b) return;
      b.className = `roi-mode-badge ${isCompound ? 'compound' : 'simple'}`;
      b.textContent = isCompound ? 'Compound' : 'Simple';
    });
    if (monthlyField) monthlyField.style.opacity = isCompound ? '1' : '.45';
    if (monthlyTag) {
      monthlyTag.textContent = isCompound ? 'Per month' : 'NOT USED';
      monthlyTag.className = `roi-field-tag ${isCompound ? '' : 'not-used'}`;
    }
    if (calcBtn) calcBtn.className = `btn-calculate mt-4 ${isCompound ? '' : 'simple-calc'}`;
    if (calcBtnText) calcBtnText.textContent = isCompound ? 'Calculate (Compound)' : 'Calculate (Simple)';
    if (compoundHint) compoundHint.style.display = 'none';
  }

  document.querySelectorAll('.roi-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      roiMode = btn.dataset.mode;
      updateRoiModeUI();
    });
  });
  switchModeLink?.addEventListener('click', e => {
    e.preventDefault();
    roiMode = 'compound';
    updateRoiModeUI();
  });
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.value = btn.dataset.val;
      const group = btn.closest('.roi-quick-btns');
      if (group) {
        group.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active', 'active-simple'));
        btn.classList.add(roiMode === 'compound' ? 'active' : 'active-simple');
      }
    });
  });
  document.getElementById('durationMinus')?.addEventListener('click', () => {
    const el = document.getElementById('roiDuration');
    if (el) el.value = Math.max(1, parseInt(el.value, 10) - 1);
  });
  document.getElementById('durationPlus')?.addEventListener('click', () => {
    const el = document.getElementById('roiDuration');
    if (el) el.value = Math.min(50, parseInt(el.value, 10) + 1);
  });

  function fmtRM(val) {
    return 'RM ' + Math.round(val).toLocaleString('en-MY');
  }
  function calcCompound(P, PMT, r, t) {
    const n = 12;
    const rt = Math.pow(1 + r / n, n * t);
    return P * rt + PMT * ((rt - 1) / (r / n));
  }
  function calcSimple(P, r, t) {
    return P * (1 + r * t);
  }
  function buildChartData(P, PMT, r, t, mode) {
    const labels = [];
    const data = [];
    for (let yr = 0; yr <= t; yr += 1) {
      labels.push(yr === 0 ? 'Now' : `Yr ${yr}`);
      const val = mode === 'compound'
        ? (yr === 0 ? P : calcCompound(P, PMT, r, yr))
        : (yr === 0 ? P : calcSimple(P, r, yr));
      data.push(Math.round(val));
    }
    return { labels, data };
  }
  function renderChart(labels, data, mode) {
    const canvas = document.getElementById('growthChart');
    if (!canvas) return;
    if (growthChart) { growthChart.destroy(); growthChart = null; }
    const color = mode === 'compound' ? '#3b6eff' : '#8b5cf6';
    growthChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: mode === 'compound' ? 'Compound Growth' : 'Simple Growth',
          data,
          borderColor: color,
          backgroundColor: color + '22',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: color,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => fmtRM(ctx.raw) } }
        },
        scales: {
          y: { ticks: { callback: v => 'RM' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) }, grid: { color: '#e2e6f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
  function calculateResults() {
    const P = parseFloat(document.getElementById('roiPrincipal')?.value) || 0;
    const PMT = parseFloat(document.getElementById('roiMonthly')?.value) || 0;
    const r = (parseFloat(document.getElementById('roiRate')?.value) || 0) / 100;
    const t = parseInt(document.getElementById('roiDuration')?.value, 10) || 0;
    const invested = roiMode === 'compound' ? P + PMT * t * 12 : P;
    const fv = roiMode === 'compound' ? (r === 0 ? invested : calcCompound(P, PMT, r, t)) : (r === 0 ? P : calcSimple(P, r, t));
    const profit = fv - invested;
    const gain = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';
    document.getElementById('investedFormula').textContent = roiMode === 'compound'
      ? `P + (PMT × ${t * 12})` : 'Principal only';
    document.getElementById('returnFormula').textContent = roiMode === 'compound'
      ? 'Future value (FV)' : 'P × (1 + r × t)';
    document.getElementById('totalInvested').textContent = fmtRM(invested);
    document.getElementById('totalReturn').textContent = fmtRM(fv);
    document.getElementById('totalProfit').textContent = '+' + fmtRM(profit);
    document.getElementById('profitGain').textContent = `↑ ${gain}% gain`;
    document.getElementById('resultsPanel').style.display = '';
    document.getElementById('scenarioPanel').style.display = '';
    const { labels, data } = buildChartData(P, PMT, r, t, roiMode);
    renderChart(labels, data, roiMode);
    if (roiMode === 'simple' && r > 0) {
      const cFV = calcCompound(P, 0, r, t);
      const diff = cFV - fv;
      document.getElementById('compoundHintText').textContent = `Compound earns ${fmtRM(diff)} more on the same initial amount over ${t} years.`;
      if (compoundHint) compoundHint.style.display = 'flex';
    } else if (compoundHint) {
      compoundHint.style.display = 'none';
    }
    calcScenario(P, PMT, t, roiMode);
  }
  function calcScenario(P, PMT, t, mode) {
    const rA = (parseFloat(document.getElementById('rateA')?.value) || 5) / 100;
    const rB = (parseFloat(document.getElementById('rateB')?.value) || 8) / 100;
    function scenarioCalc(r) {
      const invested = mode === 'compound' ? P + PMT * t * 12 : P;
      const fv = mode === 'compound' ? (r === 0 ? invested : calcCompound(P, PMT, r, t)) : (r === 0 ? P : calcSimple(P, r, t));
      const profit = fv - invested;
      const gain = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';
      return { invested, fv, profit, gain };
    }
    const a = scenarioCalc(rA);
    const b = scenarioCalc(rB);
    const aRatePct = Math.round(rA * 100);
    const bRatePct = Math.round(rB * 100);
    const profitDiff = b.profit - a.profit;
    document.getElementById('scenarioABadge').textContent = `${aRatePct}%`;
    document.getElementById('scenarioBBadge').textContent = `${bRatePct}%`;
    document.getElementById('saTotalInvested').textContent = fmtRM(a.invested);
    document.getElementById('saTotalReturn').textContent = fmtRM(a.fv);
    document.getElementById('saProfit').textContent = '+' + fmtRM(a.profit);
    document.getElementById('saGain').textContent = a.gain + '%';
    document.getElementById('sbTotalInvested').textContent = fmtRM(b.invested);
    document.getElementById('sbTotalReturn').textContent = fmtRM(b.fv);
    document.getElementById('sbProfit').textContent = '+' + fmtRM(b.profit);
    document.getElementById('sbGain').textContent = b.gain + '%';
    const deltaEl = document.getElementById('sbProfitDelta');
    if (deltaEl) deltaEl.textContent = profitDiff > 0 ? `+${fmtRM(profitDiff)}` : '';
  }
  calcBtn?.addEventListener('click', calculateResults);
  ['rateA','rateB'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      if (document.getElementById('resultsPanel')?.style.display !== 'none') {
        const P = parseFloat(document.getElementById('roiPrincipal')?.value) || 0;
        const PMT = parseFloat(document.getElementById('roiMonthly')?.value) || 0;
        const t = parseInt(document.getElementById('roiDuration')?.value, 10) || 0;
        calcScenario(P, PMT, t, roiMode);
      }
    });
  });
  updateRoiModeUI();
}

// User Management Functions
function initLoginPage() {
  if (getStoredUser()?.email) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked ?? true;

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!password) {
      alert('Please enter your password.');
      return;
    }

    try {
      const user = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setStoredUser(user, rememberMe);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please try again.');
    }
  });
}

function initRegisterPage() {
  if (getStoredUser()?.email) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name) {
      alert('Please enter your full name.');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!isStrongPassword(password)) {
      alert('Password must be at least 8 characters and include a letter and a number.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      alert('Registration successful. You can sign in now.');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Register error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    }
  });
}

function initForgotPasswordPage() {
  const form = document.getElementById('forgotPasswordForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const data = await apiRequest('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      alert(data?.message || 'Reset link sent to your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      alert(error.message || 'Failed to send reset link.');
    }
  });
}

function initProfilePage() {
  const user = requireAuthenticatedUser();
  if (!user) return;

  document.getElementById('profileName').value = user.name || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profilePhone').value = user.phone || '';
  document.getElementById('profileDOB').value = user.dob || '';
  document.getElementById('profileOccupation').value = user.occupation || '';
  document.getElementById('profileAddress').value = user.address || '';
  document.getElementById('profileCity').value = user.city || '';
  document.getElementById('profileCountry').value = user.country || '';

  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('profileName').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim(),
      dob: document.getElementById('profileDOB').value,
      occupation: document.getElementById('profileOccupation').value.trim(),
      address: document.getElementById('profileAddress').value.trim(),
      city: document.getElementById('profileCity').value.trim(),
      country: document.getElementById('profileCountry').value.trim(),
    };

    if (!payload.name) {
      alert('Name is required.');
      return;
    }

    if (!isValidEmail(payload.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const updatedUser = await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const rememberSession = Boolean(localStorage.getItem('user'));
      setStoredUser({ ...user, ...updatedUser }, rememberSession);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Update failed.');
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearStoredUser();
    window.location.href = 'login.html';
  });

  document.getElementById('changePasswordBtn')?.addEventListener('click', () => {
    window.location.href = 'forgot-password.html';
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest('/api/profile', { method: 'DELETE' });
      clearStoredUser();
      window.location.href = 'register.html';
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Delete failed.');
    }
  });
}

function initDashboardPage() {
  const user = requireAuthenticatedUser();
  if (!user) return;

  const refreshBtn = document.getElementById('refreshInsightsBtn');

  async function loadInsights() {
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refreshing...';
    }

    try {
      const data = await apiRequest('/api/market-insights');
      document.getElementById('trendValue').textContent = data.trend || 'N/A';
      document.getElementById('sp500Value').textContent = `S&P 500 ${data.sp500 || '—'}`;
      document.getElementById('topPerformerValue').textContent = data.topPerformer || 'N/A';
      document.getElementById('performanceValue').textContent = data.performance || '—';
      document.getElementById('riskLevelValue').textContent = data.riskLevel || 'N/A';
      document.getElementById('riskSummaryText').textContent = `${data.riskLevel || 'Moderate'} market risk outlook`;
      document.getElementById('marketTrendText').textContent = data.trend || 'N/A';
      document.getElementById('marketTopPerformerText').textContent = data.topPerformer || 'N/A';
      document.getElementById('marketPerformanceText').textContent = data.performance || '—';
      document.getElementById('riskBadgeText').textContent = `${data.riskLevel || 'Moderate'} Risk`;
      document.getElementById('insightUpdatedAt').textContent = new Date().toLocaleString();
    } catch (error) {
      console.error('Dashboard error:', error);
      document.getElementById('trendValue').textContent = 'Unavailable';
      document.getElementById('sp500Value').textContent = 'API offline';
      document.getElementById('topPerformerValue').textContent = 'Unavailable';
      document.getElementById('performanceValue').textContent = '—';
      document.getElementById('riskLevelValue').textContent = 'Unavailable';
      document.getElementById('riskSummaryText').textContent = 'Unable to load market insights right now.';
      document.getElementById('marketTrendText').textContent = 'Unavailable';
      document.getElementById('marketTopPerformerText').textContent = 'Unavailable';
      document.getElementById('marketPerformanceText').textContent = '—';
      document.getElementById('riskBadgeText').textContent = 'API Offline';
      document.getElementById('insightUpdatedAt').textContent = 'Request failed';
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh Insights';
      }
    }
  }

  refreshBtn?.addEventListener('click', loadInsights);
  loadInsights();
}

function initMainLogin() {
  const form = document.getElementById('mainLoginForm');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('mainEmail').value.trim();
    const password = document.getElementById('mainPassword').value;
    const rememberMe = document.getElementById('mainRememberMe')?.checked ?? true;

    if (!isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const user = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setStoredUser(user, rememberMe);
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please try again.');
    }
  });
}
