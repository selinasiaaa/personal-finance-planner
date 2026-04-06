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
});

function initNavigation(page) {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === page);
  });
}

function initGoalsPage() {
  const filterTabs = document.querySelectorAll('#goalFilterTabs .filter-tab');
  const cardWrappers = document.querySelectorAll('#goalsGrid .goal-card-wrapper');

  function filterGoals(filter) {
    cardWrappers.forEach(w => {
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
    cardWrappers.forEach(w => {
      if (w.dataset.status === 'create') return;
      const title = w.querySelector('.goal-title')?.textContent.toLowerCase() || '';
      const desc = w.querySelector('.goal-desc')?.textContent.toLowerCase() || '';
      w.style.display = (!q || title.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });

  document.getElementById('goalsGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    const wrapper = btn.closest('.goal-card-wrapper');
    const name = wrapper?.querySelector('.goal-title')?.textContent || 'this goal';
    if (wrapper && confirm(`Delete "${name}"?`)) {
      wrapper.style.transition = 'opacity .25s, transform .25s';
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'scale(.95)';
      setTimeout(() => {
        wrapper.remove();
        updateBadge();
      }, 250);
    }
  });

  function updateBadge() {
    const count = document.querySelectorAll('#goalsGrid .goal-card-wrapper:not([data-status="create"])').length;
    const badge = document.getElementById('goalsBadge');
    if (badge) badge.textContent = count;
  }

  initCategoryDropdown();
  initCreateGoalModal();
  initAiAdvisoryModal();
  updateBadge();
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
  saveGoalBtn.addEventListener('click', () => {
    const name = document.getElementById('cgName')?.value.trim();
    if (!name) { alert('Please enter a goal name.'); return; }
    const desc = document.getElementById('cgDesc')?.value.trim();
    const target = document.getElementById('cgTarget')?.value.trim() || '0';
    const monthly = document.getElementById('cgMonthly')?.value.trim() || '0';
    const dateVal = document.getElementById('cgDate')?.value;
    const icon = document.getElementById('categoryIcon')?.textContent || '🎯';
    let dateLabel = 'TBD';
    if (dateVal) {
      const [yr, mo] = dateVal.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateLabel = `${months[parseInt(mo, 10) - 1]} ${yr}`;
    }
    const newWrapper = document.createElement('div');
    newWrapper.className = 'col-12 col-md-6 col-xl-4 goal-card-wrapper';
    newWrapper.dataset.status = 'on-track';
    newWrapper.innerHTML = `\n      <div class="goal-card">\n        <div class="goal-card-top">\n          <span class="goal-icon">${icon}</span>\n          <span class="status-badge on-track">On Track</span>\n        </div>\n        <h5 class="goal-title">${esc(name)}</h5>\n        <p class="goal-desc">${esc(desc) || 'No description provided.'}</p>\n        <div class="progress goal-progress"><div class="progress-bar" style="width:0%"></div></div>\n        <p class="goal-amounts"><strong>RM 0</strong> <span>/ ${esc(target)}</span></p>\n        <div class="goal-meta">\n          <div class="meta-row">\n            <span><i class="bi bi-calendar3"></i> Target: ${dateLabel}</span>\n            <div class="goal-actions">\n              <button class="action-btn"><i class="bi bi-pencil-square"></i></button>\n              <button class="action-btn delete-btn"><i class="bi bi-trash3"></i></button>\n            </div>\n          </div>\n          <span class="meta-monthly"><i class="bi bi-coin"></i> ${esc(monthly)} / month</span>\n        </div>\n      </div>`;
    goalsGrid.insertBefore(newWrapper, createCard);
    bootstrap.Modal.getInstance(document.getElementById('createGoalModal'))?.hide();
    ['cgName','cgDesc','cgTarget','cgSavings','cgMonthly','cgDate'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('goalsBadge').textContent = document.querySelectorAll('#goalsGrid .goal-card-wrapper:not([data-status="create"])').length;
  });
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
  document.getElementById('applyPortfolioBtn')?.addEventListener('click', () => {
    const active = document.querySelector('#riskTabs .risk-tab.active');
    alert(`${active?.dataset.risk || 'Conservative'} portfolio applied to your goals!`);
  });
}

function initRoiPage() {
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
