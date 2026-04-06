/**
 * WealthTrack SPA — app.js
 * Handles: routing, goal filtering, create goal modal,
 *          AI advisory modal, investments risk switcher,
 *          ROI calculator (compound + simple), scenario comparison
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     1. SPA ROUTING
  ══════════════════════════════════════════ */
  const navItems  = document.querySelectorAll('.nav-item[data-section]');
  const sections  = document.querySelectorAll('.app-section');

  function navigateTo(sectionId) {
    sections.forEach(s => {
      s.classList.remove('active-section');
      s.style.display = 'none';
    });
    navItems.forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`${sectionId}-section`);
    const link   = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

    if (target) {
      target.style.display = 'block';
      // allow reflow then add class for animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => target.classList.add('active-section'));
      });
    }
    if (link) link.classList.add('active');
  }

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  // Init
  navigateTo('goals');

  /* ══════════════════════════════════════════
     2. GOAL FILTER TABS
  ══════════════════════════════════════════ */
  const filterTabs   = document.querySelectorAll('#goalFilterTabs .filter-tab');
  const cardWrappers = document.querySelectorAll('#goalsGrid .goal-card-wrapper');

  function filterGoals(filter) {
    cardWrappers.forEach(w => {
      const status = w.dataset.status;
      let show = false;
      if (filter === 'all') show = true;
      else if (status === 'create') show = true;
      else if (filter === 'on-track'  && status === 'on-track')  show = true;
      else if (filter === 'at-risk'   && status === 'at-risk')   show = true;
      else if (filter === 'completed' && status === 'completed') show = true;

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

  // Goal search
  const goalSearch = document.getElementById('goalSearch');
  if (goalSearch) {
    goalSearch.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      cardWrappers.forEach(w => {
        if (w.dataset.status === 'create') return;
        const title = w.querySelector('.goal-title')?.textContent.toLowerCase() || '';
        const desc  = w.querySelector('.goal-desc')?.textContent.toLowerCase()  || '';
        w.style.display = (!q || title.includes(q) || desc.includes(q)) ? '' : 'none';
      });
    });
  }

  // Delete card
  document.getElementById('goalsGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    const wrapper = btn.closest('.goal-card-wrapper');
    const name    = wrapper?.querySelector('.goal-title')?.textContent || 'this goal';
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

  /* ══════════════════════════════════════════
     3. CREATE GOAL MODAL
  ══════════════════════════════════════════ */
  // Custom category dropdown
  const trigger  = document.getElementById('categoryTrigger');
  const dropdown = document.getElementById('categoryDropdown');
  const catIcon  = document.getElementById('categoryIcon');
  const catLabel = document.getElementById('categoryLabel');

  if (trigger) {
    trigger.addEventListener('click', () => dropdown.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!e.target.closest('#categoryWrapper')) dropdown.classList.remove('open');
    });
    dropdown.querySelectorAll('.custom-option').forEach(opt => {
      opt.addEventListener('click', () => {
        dropdown.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        catIcon.textContent  = opt.dataset.icon;
        catLabel.textContent = opt.textContent.replace(opt.dataset.icon, '').trim();
        dropdown.classList.remove('open');
      });
    });
  }

  // Save goal
  const saveGoalBtn = document.getElementById('saveGoalBtn');
  const goalsGrid   = document.getElementById('goalsGrid');
  const createCard  = document.querySelector('[data-status="create"]');

  if (saveGoalBtn) {
    saveGoalBtn.addEventListener('click', () => {
      const name    = document.getElementById('cgName')?.value.trim();
      const desc    = document.getElementById('cgDesc')?.value.trim();
      const target  = document.getElementById('cgTarget')?.value.trim() || '0';
      const monthly = document.getElementById('cgMonthly')?.value.trim() || '0';
      const dateVal = document.getElementById('cgDate')?.value;
      const icon    = catIcon?.textContent || '🎯';

      if (!name) { alert('Please enter a goal name.'); return; }

      let dateLabel = 'TBD';
      if (dateVal) {
        const [yr, mo] = dateVal.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        dateLabel = `${months[parseInt(mo) - 1]} ${yr}`;
      }

      const newWrapper = document.createElement('div');
      newWrapper.className = 'col-12 col-md-6 col-xl-4 goal-card-wrapper';
      newWrapper.dataset.status = 'on-track';
      newWrapper.innerHTML = `
        <div class="goal-card">
          <div class="goal-card-top">
            <span class="goal-icon">${icon}</span>
            <span class="status-badge on-track">On Track</span>
          </div>
          <h5 class="goal-title">${esc(name)}</h5>
          <p class="goal-desc">${esc(desc) || 'No description provided.'}</p>
          <div class="progress goal-progress"><div class="progress-bar" style="width:0%"></div></div>
          <p class="goal-amounts"><strong>RM 0</strong> <span>/ ${esc(target)}</span></p>
          <div class="goal-meta">
            <div class="meta-row">
              <span><i class="bi bi-calendar3"></i> Target: ${dateLabel}</span>
              <div class="goal-actions">
                <button class="action-btn"><i class="bi bi-pencil-square"></i></button>
                <button class="action-btn delete-btn"><i class="bi bi-trash3"></i></button>
              </div>
            </div>
            <span class="meta-monthly"><i class="bi bi-coin"></i> ${esc(monthly)} / month</span>
          </div>
        </div>`;
      goalsGrid.insertBefore(newWrapper, createCard);
      bootstrap.Modal.getInstance(document.getElementById('createGoalModal'))?.hide();
      ['cgName','cgDesc','cgTarget','cgSavings','cgMonthly','cgDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      updateBadge();
    });
  }

  function esc(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  /* ══════════════════════════════════════════
     4. AI ADVISORY MODAL
  ══════════════════════════════════════════ */
  const optionA      = document.getElementById('optionA');
  const optionB      = document.getElementById('optionB');
  const applyBtn     = document.getElementById('applyOptionBtn');
  let selectedOption = null;

  function selectOption(card, key) {
    [optionA, optionB].forEach(c => c?.classList.remove('selected'));
    card?.classList.add('selected');
    selectedOption = key;
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.classList.add('ready');
      applyBtn.textContent = `Apply Option ${key}`;
    }
  }

  optionA?.addEventListener('click', () => selectOption(optionA, 'A'));
  optionB?.addEventListener('click', () => selectOption(optionB, 'B'));

  applyBtn?.addEventListener('click', () => {
    if (selectedOption) {
      alert(`Option ${selectedOption} applied! Monthly target has been updated.`);
      bootstrap.Modal.getInstance(document.getElementById('aiAdvisoryModal'))?.hide();
    }
  });

  document.getElementById('aiAdvisoryModal')?.addEventListener('hidden.bs.modal', () => {
    [optionA, optionB].forEach(c => c?.classList.remove('selected'));
    selectedOption = null;
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.classList.remove('ready');
      applyBtn.textContent = 'Apply Selected Option';
    }
  });

  /* ══════════════════════════════════════════
     5. INVESTMENTS — RISK PROFILE SWITCHER
  ══════════════════════════════════════════ */
  const RISK_DATA = {
    conservative: {
      tab: 'conservative',
      bannerGrad: 'linear-gradient(135deg, #2e7d32, #4caf50)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● LOW RISK',
      title: 'Conservative Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '3–5%',
      allocation: [
        { label: 'Fixed Deposit / ASB — 50%', pct: 50, color: '#1b5e20' },
        { label: 'Sukuk / Bonds — 30%',       pct: 30, color: '#4caf50' },
        { label: 'Money Market — 20%',         pct: 20, color: '#a5d6a7' },
      ],
      instruments: ['ASB (Amanah Saham)', 'Sukuk', 'Fixed Deposit', 'Money Market Fund'],
      instrColor: { border: '#4caf50', text: '#2e7d32', bg: '#f1f8e9' },
      goals: ['🚨 Emergency Fund (3–6 months expenses)', '✈️ Travel Fund (1–2 years)', '🎓 Education Savings (short-term)'],
      quote: 'Capital safety is your priority. Keep losses minimal and grow your savings steadily. Ideal if you need the money within 1–3 years.',
      quoteColor: '#2e7d32', quoteBg: '#f1f8e9',
    },
    balanced: {
      tab: 'balanced',
      bannerGrad: 'linear-gradient(135deg, #1565c0, #42a5f5)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● MEDIUM RISK',
      title: 'Balanced Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '6–10%',
      allocation: [
        { label: 'ETFs / Unit Trusts — 40%', pct: 40, color: '#1565c0' },
        { label: 'Blue-chip Stocks — 35%',   pct: 35, color: '#42a5f5' },
        { label: 'Bonds / Sukuk — 25%',      pct: 25, color: '#bbdefb' },
      ],
      instruments: ['Bursa Malaysia ETFs', 'Sukuk', 'Blue-chip Stocks', 'Unit Trusts'],
      instrColor: { border: '#42a5f5', text: '#1565c0', bg: '#e3f2fd' },
      goals: ['🏠 House Down Payment (3–7 years)', '💍 Wedding Fund', '📈 Wealth Building (medium-term)'],
      quote: 'Balance growth with stability. Diversify across stocks and bonds. Review your portfolio every 6 months and stay patient through market dips.',
      quoteColor: '#1565c0', quoteBg: '#e3f2fd',
    },
    aggressive: {
      tab: 'aggressive',
      bannerGrad: 'linear-gradient(135deg, #b71c1c, #ef5350)',
      tagBg: 'rgba(0,0,0,.25)', tagColor: '#fff',
      tagText: '● HIGH RISK',
      title: 'Aggressive Investment Plan',
      returnLabel: 'EXPECTED RETURN:',
      returnVal: '10–20%+',
      allocation: [
        { label: 'Growth Stocks — 60%',         pct: 60, color: '#c62828' },
        { label: 'REITs / Sector Funds — 25%',  pct: 25, color: '#ef5350' },
        { label: 'Crypto / Alternative — 15%',  pct: 15, color: '#ffcdd2' },
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
    if (!riskContent) return;

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
  riskTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      riskTabs.forEach(t => { t.classList.remove('active', 'conservative', 'balanced', 'aggressive'); });
      tab.classList.add('active', tab.dataset.risk);
      renderRisk(tab.dataset.risk);
    });
  });

  // Init investments
  const firstRiskTab = document.querySelector('#riskTabs .risk-tab');
  if (firstRiskTab) {
    firstRiskTab.classList.add('active', 'conservative');
    renderRisk('conservative');
  }

  document.getElementById('applyPortfolioBtn')?.addEventListener('click', () => {
    const active = document.querySelector('#riskTabs .risk-tab.active');
    alert(`${active?.dataset.risk || 'Conservative'} portfolio applied to your goals!`);
  });

  /* ══════════════════════════════════════════
     6. ROI CALCULATOR
  ══════════════════════════════════════════ */
  let roiMode   = 'compound';
  let growthChart = null;

  const roiModeToggle = document.getElementById('roiModeToggle');
  const modeBanner    = document.getElementById('modeBanner');
  const modeBannerStrong = document.getElementById('modeBannerStrong');
  const modeBannerText   = document.getElementById('modeBannerText');
  const paramBadge    = document.getElementById('paramBadge');
  const resultBadge   = document.getElementById('resultBadge');
  const scenarioBadge = document.getElementById('scenarioBadge');
  const calcBtnText   = document.getElementById('calcBtnText');
  const calcBtn       = document.getElementById('calculateBtn');
  const monthlyField  = document.getElementById('monthlyField');
  const monthlyTag    = document.getElementById('monthlyTag');
  const compoundHint  = document.getElementById('compoundHint');
  const switchModeLink = document.getElementById('switchModeLink');

  function updateRoiModeUI() {
    const modeButtons = document.querySelectorAll('.roi-mode-btn');
    modeButtons.forEach(b => {
      b.classList.remove('active','compound-active','simple-active');
      if (b.dataset.mode === roiMode) {
        b.classList.add('active', roiMode === 'compound' ? 'compound-active' : 'simple-active');
      }
    });

    const isCompound = roiMode === 'compound';

    // Banner
    modeBanner.className = `mode-banner mb-4 ${isCompound ? 'compound-banner' : 'simple-banner'}`;
    if (modeBannerStrong) modeBannerStrong.style.color = isCompound ? '#1e40af' : '#6b21a8';
    if (modeBannerStrong) modeBannerStrong.textContent = isCompound ? 'Compound mode active' : 'Simple mode active';
    if (modeBannerText) modeBannerText.textContent = isCompound
      ? ' — interest is reinvested each month and added to your balance.'
      : ' — interest is calculated only on the initial investment and does not compound.';

    // Badges
    const badgeClass = isCompound ? 'compound' : 'simple';
    const badgeLabel = isCompound ? 'Compound' : 'Simple';
    [paramBadge, resultBadge, scenarioBadge].forEach(b => {
      if (b) { b.className = `roi-mode-badge ${badgeClass}`; b.textContent = badgeLabel; }
    });

    // Monthly field greyed out for simple
    if (monthlyField) monthlyField.style.opacity = isCompound ? '1' : '.45';
    if (monthlyTag) { monthlyTag.textContent = isCompound ? 'Per month' : 'NOT USED'; monthlyTag.className = `roi-field-tag ${isCompound ? '' : 'not-used'}`; }

    // Calculate button
    if (calcBtn) { calcBtn.className = `btn-calculate mt-4 ${isCompound ? '' : 'simple-calc'}`; }
    if (calcBtnText) calcBtnText.textContent = isCompound ? 'Calculate (Compound)' : 'Calculate (Simple)';

    // Quick btn active class
    document.querySelectorAll('.quick-btn.active').forEach(b => {
      b.className = `quick-btn ${isCompound ? 'active' : 'active-simple'}`;
    });

    // Hint visibility
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

  // Quick buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      target.value = btn.dataset.val;
      // Update active state in same group
      const group = btn.closest('.roi-quick-btns');
      if (group) {
        group.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active', 'active-simple'));
        btn.classList.add(roiMode === 'compound' ? 'active' : 'active-simple');
      }
    });
  });

  // Duration steppers
  document.getElementById('durationMinus')?.addEventListener('click', () => {
    const el = document.getElementById('roiDuration');
    if (el) el.value = Math.max(1, parseInt(el.value) - 1);
  });
  document.getElementById('durationPlus')?.addEventListener('click', () => {
    const el = document.getElementById('roiDuration');
    if (el) el.value = Math.min(50, parseInt(el.value) + 1);
  });

  // Format currency
  function fmtRM(val) {
    return 'RM ' + Math.round(val).toLocaleString('en-MY');
  }

  // Compound: FV = P*(1+r/n)^(n*t) + PMT * [((1+r/n)^(n*t) - 1) / (r/n)]
  function calcCompound(P, PMT, r, t) {
    const n  = 12; // monthly compounding
    const rt = Math.pow(1 + r / n, n * t);
    const FV = P * rt + PMT * ((rt - 1) / (r / n));
    return Math.max(FV, P);
  }

  // Simple: FV = P * (1 + r*t)
  function calcSimple(P, r, t) {
    return P * (1 + r * t);
  }

  // Build chart data labels (years)
  function buildChartData(P, PMT, r, t, mode) {
    const labels = [];
    const data   = [];
    for (let yr = 0; yr <= t; yr++) {
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
          tooltip: {
            callbacks: { label: ctx => fmtRM(ctx.raw) }
          }
        },
        scales: {
          y: { ticks: { callback: v => 'RM' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: '#e2e6f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function calculateResults() {
    const P   = parseFloat(document.getElementById('roiPrincipal')?.value) || 0;
    const PMT = parseFloat(document.getElementById('roiMonthly')?.value)   || 0;
    const r   = (parseFloat(document.getElementById('roiRate')?.value)     || 0) / 100;
    const t   = parseInt(document.getElementById('roiDuration')?.value)    || 0;

    let invested, fv, profit, gain;

    if (roiMode === 'compound') {
      invested = P + PMT * t * 12;
      fv       = r === 0 ? invested : calcCompound(P, PMT, r, t);
    } else {
      invested = P; // simple uses principal only
      fv       = r === 0 ? P : calcSimple(P, r, t);
    }
    profit = fv - invested;
    gain   = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';

    // Update DOM
    const n = t * 12;
    document.getElementById('investedFormula').textContent = roiMode === 'compound'
      ? `P + (PMT × ${n})` : 'Principal only';
    document.getElementById('returnFormula').textContent = roiMode === 'compound'
      ? 'Future value (FV)' : 'P × (1 + r × t)';
    document.getElementById('totalInvested').textContent = fmtRM(invested);
    document.getElementById('totalReturn').textContent   = fmtRM(fv);
    document.getElementById('totalProfit').textContent   = '+' + fmtRM(profit);
    document.getElementById('profitGain').textContent    = `↑ ${gain}% gain`;

    document.getElementById('resultsPanel').style.display = '';
    document.getElementById('scenarioPanel').style.display = '';

    // Chart
    const { labels, data } = buildChartData(P, PMT, r, t, roiMode);
    renderChart(labels, data, roiMode);

    // Simple vs compound hint
    if (roiMode === 'simple' && r > 0) {
      const cFV    = calcCompound(P, 0, r, t);
      const diff   = cFV - fv;
      const hintEl = document.getElementById('compoundHintText');
      if (hintEl) hintEl.textContent = `Compound earns ${fmtRM(diff)} more on the same initial amount over ${t} years.`;
      if (compoundHint) compoundHint.style.display = 'flex';
    } else {
      if (compoundHint) compoundHint.style.display = 'none';
    }

    // Scenario comparison
    calcScenario(P, PMT, t, roiMode);
  }

  function calcScenario(P, PMT, t, mode) {
    const rA = parseFloat(document.getElementById('rateA')?.value || 5) / 100;
    const rB = parseFloat(document.getElementById('rateB')?.value || 8) / 100;

    function scenarioCalc(r) {
      if (mode === 'compound') {
        const invested = P + PMT * t * 12;
        const fv       = r === 0 ? invested : calcCompound(P, PMT, r, t);
        const profit   = fv - invested;
        const gain     = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';
        return { invested, fv, profit, gain };
      } else {
        const invested = P;
        const fv       = r === 0 ? P : calcSimple(P, r, t);
        const profit   = fv - invested;
        const gain     = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';
        return { invested, fv, profit, gain };
      }
    }

    const a = scenarioCalc(rA);
    const b = scenarioCalc(rB);

    const aRatePct = Math.round(rA * 100);
    const bRatePct = Math.round(rB * 100);
    const profitDiff = b.profit - a.profit;

    document.getElementById('scenarioABadge').textContent = `${aRatePct}%`;
    document.getElementById('scenarioBBadge').textContent = `${bRatePct}%`;
    document.getElementById('saTotalInvested').textContent = fmtRM(a.invested);
    document.getElementById('saTotalReturn').textContent   = fmtRM(a.fv);
    document.getElementById('saProfit').textContent        = '+' + fmtRM(a.profit);
    document.getElementById('saGain').textContent          = a.gain + '%';

    document.getElementById('sbTotalInvested').textContent = fmtRM(b.invested);
    document.getElementById('sbTotalReturn').textContent   = fmtRM(b.fv);
    document.getElementById('sbProfit').textContent        = '+' + fmtRM(b.profit);
    document.getElementById('sbGain').textContent          = b.gain + '%';

    const deltaEl = document.getElementById('sbProfitDelta');
    if (deltaEl) deltaEl.textContent = profitDiff > 0 ? `+${fmtRM(profitDiff)}` : '';
  }

  document.getElementById('calculateBtn')?.addEventListener('click', calculateResults);

  // Scenario rate inputs — recalculate on change
  ['rateA','rateB'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      if (document.getElementById('resultsPanel')?.style.display !== 'none') {
        const P = parseFloat(document.getElementById('roiPrincipal')?.value) || 0;
        const PMT = parseFloat(document.getElementById('roiMonthly')?.value) || 0;
        const t   = parseInt(document.getElementById('roiDuration')?.value)  || 0;
        calcScenario(P, PMT, t, roiMode);
      }
    });
  });

  // Init mode UI
  updateRoiModeUI();

});