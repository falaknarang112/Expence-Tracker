function svgIcon(inner) {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}

var ICO = {
  food:     svgIcon('<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/>'),
  transport: svgIcon('<path d="M5 17h14v-5H5z"/><path d="M6 12l2-5h8l2 5"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>'),
  shopping: svgIcon('<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
  entertainment: svgIcon('<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>'),
  rent:    svgIcon('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  books:   svgIcon('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  health:  svgIcon('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
  subs:    svgIcon('<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/>'),
  travel:  svgIcon('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  other:   svgIcon('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>')
};

var CATEGORIES = [
  { name: 'Food & Canteen', icon: ICO.food, color: '#f59e0b' },
  { name: 'Transport', icon: ICO.transport, color: '#3b82f6' },
  { name: 'Shopping', icon: ICO.shopping, color: '#ec4899' },
  { name: 'Entertainment', icon: ICO.entertainment, color: '#8b5cf6' },
  { name: 'Rent & Bills', icon: ICO.rent, color: '#10b981' },
  { name: 'Books & Supplies', icon: ICO.books, color: '#06b6d4' },
  { name: 'Health', icon: ICO.health, color: '#ef4444' },
  { name: 'Subscriptions', icon: ICO.subs, color: '#f97316' },
  { name: 'Travel', icon: ICO.travel, color: '#84cc16' },
  { name: 'Other', icon: ICO.other, color: '#6b7280' }
];

var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var PER_PAGE = 10;

var APP = {
  user: null,
  expenses: [],
  budgets: {},
  view: 'dashboard',
  editId: null,
  deleteId: null,
  pendingAction: null,
  expPage: 1,
  chatOpen: false
};

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function fmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d) {
  var dt = new Date(d + 'T00:00:00');
  return MONTHS[dt.getMonth()] + ' ' + dt.getDate() + ', ' + dt.getFullYear();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function catInfo(name) {
  return CATEGORIES.find(function(c) { return c.name === name; }) || CATEGORIES[CATEGORIES.length - 1];
}

function esc(str) {
  var el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

function getMonthKey(d) {
  var dt = new Date(d + 'T00:00:00');
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
}

function getMonthLabel(key) {
  var parts = key.split('-');
  return MONTHS[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

function getCurrentMonthKey() {
  var n = new Date();
  return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0');
}

function getExpenseMonths() {
  var keys = {};
  APP.expenses.forEach(function(e) { keys[getMonthKey(e.date)] = true; });
  return Object.keys(keys).sort().reverse();
}

function getMonthExpenses(key) {
  return APP.expenses.filter(function(e) { return getMonthKey(e.date) === key; });
}

function getCatTotal(list, cat) {
  return list.filter(function(e) { return e.category === cat; }).reduce(function(s, e) { return s + e.amount; }, 0);
}

function toast(msg, type) {
  var el = document.createElement('div');
  el.className = 'toast ' + (type || 'info');
  el.textContent = msg;
  $('#toastContainer').appendChild(el);
  setTimeout(function() { el.remove(); }, 3100);
}

function getJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch(e) { return fallback; }
}

function setJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getUsers() { return getJSON('pl_users', []); }
function saveUsers(u) { setJSON('pl_users', u); }
function getSession() { return getJSON('pl_session', null); }
function saveSession(u) { setJSON('pl_session', u); }
function clearSession() { localStorage.removeItem('pl_session'); }

function loadUserData() {
  APP.expenses = getJSON('pl_exp_' + APP.user.username, []);
  APP.budgets = getJSON('pl_bud_' + APP.user.username, {});
}

function saveExpenses() { setJSON('pl_exp_' + APP.user.username, APP.expenses); }
function saveBudgets() { setJSON('pl_bud_' + APP.user.username, APP.budgets); }

function initAuth() {
  $$('.auth-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      $$('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      $$('.auth-form').forEach(function(f) { f.classList.remove('active'); });
      $('#' + tab.dataset.tab + 'Form').classList.add('active');
      $('#authError').textContent = '';
    });
  });

  $('#loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var u = $('#loginUser').value.trim();
    var p = $('#loginPass').value;
    if (!u || !p) return;
    var users = getUsers();
    var found = users.find(function(x) { return x.username === u && atob(x.password) === p; });
    if (!found) {
      $('#authError').textContent = 'Wrong username or password';
      return;
    }
    APP.user = { username: found.username, name: found.name };
    saveSession(APP.user);
    enterApp();
  });

  $('#signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = $('#signupName').value.trim();
    var u = $('#signupUser').value.trim();
    var p = $('#signupPass').value;
    if (!name || !u || !p) return;
    if (p.length < 4) {
      $('#authError').textContent = 'Password needs at least 4 characters';
      return;
    }
    var users = getUsers();
    if (users.find(function(x) { return x.username === u; })) {
      $('#authError').textContent = 'That username is taken';
      return;
    }
    users.push({ username: u, name: name, password: btoa(p) });
    saveUsers(users);
    APP.user = { username: u, name: name };
    saveSession(APP.user);
    enterApp();
  });
}

function enterApp() {
  loadUserData();
  $('#authOverlay').classList.add('hidden');
  $('#app').classList.add('active');
  $('#userName').textContent = APP.user.name;
  $('#userAvatar').textContent = APP.user.name.charAt(0).toUpperCase();

  var hour = new Date().getHours();
  var greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  $('#dashGreeting').textContent = greet + ', ' + APP.user.name.split(' ')[0] + '!';

  populateFilters();
  navigateTo('dashboard');
  addBotMsg("Hey! I'm Buddy, your expense helper. Ask me stuff like \"how much did I spend?\" or type <strong>help</strong> to see what I know!");
}

function logout() {
  clearSession();
  APP.user = null;
  APP.expenses = [];
  APP.budgets = {};
  $('#authOverlay').classList.remove('hidden');
  $('#app').classList.remove('active');
  $('#loginUser').value = '';
  $('#loginPass').value = '';
  $$('.auth-tab')[0].click();
}

function resetData() {
  APP.pendingAction = 'reset';
  $('#confirmTitle').textContent = 'Reset all data?';
  $('#confirmText').textContent = 'This will delete all your expenses and budgets permanently.';
  $('#confirmActionBtn').textContent = 'Reset';
  openModal('confirmModal');
}

function doReset() {
  APP.expenses = [];
  APP.budgets = {};
  saveExpenses();
  saveBudgets();
  closeModal('confirmModal');
  toast('All data cleared!', 'success');
  updateMonthFilter();
  navigateTo('dashboard');
}

function navigateTo(view) {
  APP.view = view;
  $$('.view').forEach(function(v) { v.classList.remove('active'); });
  $('#view-' + view).classList.add('active');
  $$('.nav-item').forEach(function(n) {
    n.classList.toggle('active', n.dataset.view === view);
  });

  if (view === 'dashboard') renderDashboard();
  else if (view === 'expenses') renderExpenses();
  else if (view === 'budgets') renderBudgets();
  else if (view === 'compare') renderCompare();

  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('open');
}

function renderDashboard() {
  var curKey = getCurrentMonthKey();
  var curExp = getMonthExpenses(curKey);
  var months = getExpenseMonths();
  var prevKey = null;
  for (var i = 0; i < months.length; i++) {
    if (months[i] < curKey) { prevKey = months[i]; break; }
  }
  var prevExp = prevKey ? getMonthExpenses(prevKey) : [];

  var totalSpent = curExp.reduce(function(s, e) { return s + e.amount; }, 0);
  var totalBudget = Object.values(APP.budgets).reduce(function(s, v) { return s + v; }, 0);
  var remaining = totalBudget - totalSpent;
  var prevTotal = prevExp.reduce(function(s, e) { return s + e.amount; }, 0);
  var change = prevTotal > 0 ? ((totalSpent - prevTotal) / prevTotal * 100) : 0;

  $('#statsGrid').innerHTML =
    '<div class="stat-card">' +
      '<div class="stat-label">Spent This Month</div>' +
      '<div class="stat-value">' + fmt(totalSpent) + '</div>' +
      (prevTotal > 0 ? '<div class="stat-note ' + (change > 0 ? 'up' : 'down') + '">' + (change > 0 ? 'Up' : 'Down') + ' ' + Math.abs(change).toFixed(1) + '% vs last month</div>' : '') +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-label">Budget Left</div>' +
      '<div class="stat-value" style="color:' + (remaining >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmt(Math.abs(remaining)) + '</div>' +
      '<div class="stat-note">' + (remaining >= 0 ? 'Under budget' : 'Over budget') + '</div>' +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-label">Transactions</div>' +
      '<div class="stat-value">' + curExp.length + '</div>' +
      '<div class="stat-note">This month</div>' +
    '</div>' +
    '<div class="stat-card">' +
      '<div class="stat-label">Avg Per Expense</div>' +
      '<div class="stat-value">' + (curExp.length > 0 ? fmt(totalSpent / curExp.length) : '₹0') + '</div>' +
      '<div class="stat-note">Per transaction</div>' +
    '</div>';

  var catData = CATEGORIES.map(function(c) {
    return { name: c.name, color: c.color, value: getCatTotal(curExp, c.name) };
  }).filter(function(d) { return d.value > 0; });
  drawDonut($('#donutChart'), catData, totalSpent);

  $('#donutLegend').innerHTML = catData.map(function(d) {
    return '<div class="legend-item"><span class="legend-dot" style="background:' + d.color + '"></span>' +
      d.name + '<span class="legend-val">' + fmt(d.value) + '</span></div>';
  }).join('');

  var last = APP.expenses.slice(0, 7);
  if (last.length === 0) {
    $('#recentList').innerHTML = '<div class="empty-state"><div class="icon">' +
      svgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') +
      '</div><p>No transactions yet</p></div>';
  } else {
    $('#recentList').innerHTML = last.map(function(e) {
      var ci = catInfo(e.category);
      return '<div class="recent-item">' +
        '<div class="recent-icon" style="background:' + ci.color + '18;color:' + ci.color + '">' + ci.icon + '</div>' +
        '<div class="recent-details"><div class="recent-desc">' + esc(e.description) + '</div>' +
        '<div class="recent-meta">' + fmtDate(e.date) + ' - ' + e.category + '</div></div>' +
        '<div class="recent-amt">' + fmt(e.amount) + '</div></div>';
    }).join('');
  }
}

function initCanvas(canvas) {
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx: ctx, w: rect.width, h: rect.height };
}

function drawDonut(canvas, data, total) {
  var c = initCanvas(canvas);
  var ctx = c.ctx, w = c.w, h = c.h;
  ctx.clearRect(0, 0, w, h);

  var cx = w / 2, cy = h / 2 - 8;
  var r = Math.min(cx, cy) - 12;
  var inner = r * 0.6;
  var gap = 0.03;

  if (data.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = '#2a2a38';
    ctx.fill();
    ctx.fillStyle = '#555568';
    ctx.font = '600 13px Nunito';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data yet', cx, cy);
    return;
  }

  var angle = -Math.PI / 2;
  data.forEach(function(d) {
    var slice = (d.value / total) * Math.PI * 2 - gap;
    if (slice <= 0) return;
    ctx.beginPath();
    ctx.arc(cx, cy, r, angle + gap / 2, angle + slice + gap / 2);
    ctx.arc(cx, cy, inner, angle + slice + gap / 2, angle + gap / 2, true);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += slice + gap;
  });

  ctx.fillStyle = '#e2e2e8';
  ctx.font = '800 20px Nunito';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fmt(total), cx, cy - 5);
  ctx.fillStyle = '#555568';
  ctx.font = '600 10px Nunito';
  ctx.fillText('THIS MONTH', cx, cy + 13);
}

function drawCompareChart(canvas, dataA, dataB, labelA, labelB) {
  var c = initCanvas(canvas);
  var ctx = c.ctx, w = c.w, h = c.h;
  ctx.clearRect(0, 0, w, h);

  var cats = CATEGORIES.filter(function(cat) {
    return (dataA[cat.name] || 0) > 0 || (dataB[cat.name] || 0) > 0;
  });

  if (cats.length === 0) {
    ctx.fillStyle = '#555568';
    ctx.font = '600 13px Nunito';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Nothing to compare yet', w / 2, h / 2);
    return;
  }

  var pad = { t: 28, r: 16, b: 52, l: 54 };
  var cw = w - pad.l - pad.r;
  var ch = h - pad.t - pad.b;
  var maxVal = 50;
  cats.forEach(function(cat) {
    maxVal = Math.max(maxVal, dataA[cat.name] || 0, dataB[cat.name] || 0);
  });
  var groupW = cw / cats.length;
  var barW = Math.min(groupW * 0.3, 24);

  for (var i = 0; i <= 4; i++) {
    var y = pad.t + (ch / 4) * i;
    ctx.strokeStyle = '#2a2a38'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#555568';
    ctx.font = '600 10px Nunito'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var val = maxVal - (maxVal / 4) * i;
    ctx.fillText('₹' + Math.round(val).toLocaleString('en-IN'), pad.l - 8, y);
  }

  cats.forEach(function(cat, i) {
    var cx = pad.l + i * groupW + groupW / 2;
    var vA = dataA[cat.name] || 0;
    var vB = dataB[cat.name] || 0;
    var hA = (vA / maxVal) * ch;
    var hB = (vB / maxVal) * ch;

    roundedBar(ctx, cx - barW - 1, pad.t + ch - hA, barW, hA, 3, '#818cf8');
    roundedBar(ctx, cx + 1, pad.t + ch - hB, barW, hB, 3, '#3a3a5a');

    ctx.fillStyle = '#555568';
    ctx.font = '600 9px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var shortName = cat.name.split(' ')[0];
    if (shortName === 'Books') shortName = 'Books';
    if (shortName === 'Rent') shortName = 'Rent';
    ctx.fillText(shortName, cx, pad.t + ch + 10);
  });

  ctx.fillStyle = '#818cf8'; ctx.fillRect(w - pad.r - 110, 6, 10, 10);
  ctx.fillStyle = '#9ca3af'; ctx.font = '600 10px Nunito'; ctx.textAlign = 'left';
  ctx.fillText(labelA, w - pad.r - 96, 15);
  ctx.fillStyle = '#3a3a5a'; ctx.fillRect(w - pad.r - 110, 22, 10, 10);
  ctx.fillStyle = '#9ca3af'; ctx.fillText(labelB, w - pad.r - 96, 31);
}

function roundedBar(ctx, x, y, w, h, r, color) {
  if (h < 1) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function populateFilters() {
  var catSel = $('#expenseCatFilter');
  catSel.innerHTML = '<option value="">All Categories</option>' +
    CATEGORIES.map(function(c) { return '<option value="' + c.name + '">' + c.name + '</option>'; }).join('');

  var catModal = $('#expCategory');
  catModal.innerHTML = CATEGORIES.map(function(c) {
    return '<option value="' + c.name + '">' + c.name + '</option>';
  }).join('');

  updateMonthFilter();
}

function updateMonthFilter() {
  var sel = $('#expenseMonthFilter');
  var months = getExpenseMonths();
  sel.innerHTML = '<option value="">All Months</option>' +
    months.map(function(m) { return '<option value="' + m + '">' + getMonthLabel(m) + '</option>'; }).join('');
}

function getFilteredExpenses() {
  var list = APP.expenses.slice();
  var search = $('#expenseSearch').value.toLowerCase().trim();
  var cat = $('#expenseCatFilter').value;
  var month = $('#expenseMonthFilter').value;
  if (search) list = list.filter(function(e) {
    return e.description.toLowerCase().includes(search) || e.category.toLowerCase().includes(search);
  });
  if (cat) list = list.filter(function(e) { return e.category === cat; });
  if (month) list = list.filter(function(e) { return getMonthKey(e.date) === month; });
  return list;
}

function renderExpenses() {
  var filtered = getFilteredExpenses();
  var totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  APP.expPage = Math.min(APP.expPage, totalPages);
  var start = (APP.expPage - 1) * PER_PAGE;
  var page = filtered.slice(start, start + PER_PAGE);

  var tbody = $('#expensesBody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">' +
      '<div class="empty-state"><div class="icon">' +
      svgIcon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>') +
      '</div><h3>No expenses found</h3>' +
      '<p>' + (APP.expenses.length === 0 ? 'Start by adding your first expense!' : 'Try changing your filters') + '</p>' +
      '</div></td></tr>';
  } else {
    tbody.innerHTML = page.map(function(e) {
      var ci = catInfo(e.category);
      return '<tr>' +
        '<td style="white-space:nowrap;color:var(--text-muted)">' + fmtDate(e.date) + '</td>' +
        '<td><strong>' + esc(e.description) + '</strong></td>' +
        '<td><span class="cat-badge" style="background:' + ci.color + '18;color:' + ci.color + '">' + ci.icon + ' ' + e.category + '</span></td>' +
        '<td style="font-weight:800;font-variant-numeric:tabular-nums">' + fmt(e.amount) + '</td>' +
        '<td><div class="expense-actions">' +
          '<button class="btn-icon" title="Edit" onclick="openExpenseModal(\'' + e.id + '\')">' +
            '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
          '<button class="btn-icon delete" title="Delete" onclick="confirmDelete(\'' + e.id + '\')">' +
            '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div></td></tr>';
    }).join('');
  }

  var pag = $('#expPagination');
  if (totalPages <= 1) { pag.innerHTML = ''; return; }
  var html = '<button class="page-btn" ' + (APP.expPage === 1 ? 'disabled' : '') + ' onclick="APP.expPage--;renderExpenses()">&#8249;</button>';
  for (var i = 1; i <= totalPages; i++) {
    html += '<button class="page-btn ' + (i === APP.expPage ? 'active' : '') + '" onclick="APP.expPage=' + i + ';renderExpenses()">' + i + '</button>';
  }
  html += '<button class="page-btn" ' + (APP.expPage === totalPages ? 'disabled' : '') + ' onclick="APP.expPage++;renderExpenses()">&#8250;</button>';
  pag.innerHTML = html;
}

function openExpenseModal(id) {
  APP.editId = id || null;
  var exp = id ? APP.expenses.find(function(e) { return e.id === id; }) : null;
  $('#expenseModalTitle').textContent = exp ? 'Edit Expense' : 'Add Expense';
  $('#expDesc').value = exp ? exp.description : '';
  $('#expAmount').value = exp ? exp.amount : '';
  $('#expCategory').value = exp ? exp.category : CATEGORIES[0].name;
  $('#expDate').value = exp ? exp.date : new Date().toISOString().split('T')[0];
  openModal('expenseModal');
}

function confirmDelete(id) {
  APP.deleteId = id;
  APP.pendingAction = 'delete';
  $('#confirmTitle').textContent = 'Delete this expense?';
  $('#confirmText').textContent = "This can't be undone.";
  $('#confirmActionBtn').textContent = 'Delete';
  openModal('confirmModal');
}

function initExpenses() {
  $('#expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var data = {
      id: APP.editId || uid(),
      description: $('#expDesc').value.trim(),
      amount: parseFloat($('#expAmount').value),
      category: $('#expCategory').value,
      date: $('#expDate').value
    };
    if (APP.editId) {
      var idx = APP.expenses.findIndex(function(x) { return x.id === APP.editId; });
      if (idx >= 0) APP.expenses[idx] = data;
    } else {
      APP.expenses.push(data);
    }
    APP.expenses.sort(function(a, b) { return b.date.localeCompare(a.date); });
    saveExpenses();
    closeModal('expenseModal');
    toast(APP.editId ? 'Expense updated!' : 'Expense added!', 'success');
    APP.editId = null;
    updateMonthFilter();
    if (APP.view === 'expenses') renderExpenses();
  });

  $('#confirmActionBtn').addEventListener('click', function() {
    if (APP.pendingAction === 'reset') {
      doReset();
    } else {
      APP.expenses = APP.expenses.filter(function(e) { return e.id !== APP.deleteId; });
      saveExpenses();
      closeModal('confirmModal');
      toast('Expense deleted', 'success');
      updateMonthFilter();
      if (APP.view === 'expenses') renderExpenses();
      if (APP.view === 'dashboard') renderDashboard();
    }
    APP.pendingAction = null;
  });

  $('#addExpenseBtn').addEventListener('click', function() { openExpenseModal(); });
  $('#expenseSearch').addEventListener('input', function() { APP.expPage = 1; renderExpenses(); });
  $('#expenseCatFilter').addEventListener('change', function() { APP.expPage = 1; renderExpenses(); });
  $('#expenseMonthFilter').addEventListener('change', function() { APP.expPage = 1; renderExpenses(); });
}

function renderBudgets() {
  var curKey = getCurrentMonthKey();
  var curExp = getMonthExpenses(curKey);
  var totalBudget = Object.values(APP.budgets).reduce(function(s, v) { return s + v; }, 0);
  var totalSpent = curExp.reduce(function(s, e) { return s + e.amount; }, 0);
  var onTrack = CATEGORIES.filter(function(c) {
    return getCatTotal(curExp, c.name) <= (APP.budgets[c.name] || 0);
  }).length;

  $('#budgetSummary').innerHTML =
    '<div class="summary-card"><div class="label">Total Budget</div><div class="value" style="color:var(--primary)">' + fmt(totalBudget) + '</div></div>' +
    '<div class="summary-card"><div class="label">Spent So Far</div><div class="value">' + fmt(totalSpent) + '</div></div>' +
    '<div class="summary-card"><div class="label">On Track</div><div class="value" style="color:var(--success)">' + onTrack + ' / ' + CATEGORIES.length + '</div></div>';

  $('#budgetsGrid').innerHTML = CATEGORIES.map(function(c) {
    var budget = APP.budgets[c.name] || 0;
    var spent = getCatTotal(curExp, c.name);
    var pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    var fullPct = budget > 0 ? (spent / budget) * 100 : 0;
    var status = 'ok', cls = 'status-ok';
    if (fullPct > 90) { status = 'over'; cls = 'status-over'; }
    else if (fullPct > 75) { status = 'warn'; cls = 'status-warn'; }
    var barColor = status === 'over' ? 'var(--danger)' : status === 'warn' ? 'var(--warning)' : 'var(--success)';
    var remaining = budget - spent;

    return '<div class="budget-card" onclick="openBudgetModal(\'' + c.name + '\')">' +
      '<div class="budget-header"><div class="budget-cat">' +
        '<span class="budget-cat-icon" style="color:' + c.color + '">' + c.icon + '</span>' +
        '<span class="budget-cat-name">' + c.name + '</span></div>' +
        '<div class="budget-amounts"><div class="budget-spent">' + fmt(spent) + '</div>' +
        '<div class="budget-limit">of ' + fmt(budget) + '</div></div></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div>' +
      '<div class="budget-footer"><span class="budget-pct ' + cls + '">' + fullPct.toFixed(0) + '%</span>' +
        '<span class="budget-left">' + (remaining >= 0 ? fmt(remaining) + ' left' : fmt(Math.abs(remaining)) + ' over') + '</span></div></div>';
  }).join('');
}

function openBudgetModal(cat) {
  $('#budgetCat').value = cat;
  $('#budgetAmount').value = APP.budgets[cat] || '';
  $('#budgetModalTitle').textContent = 'Set Budget - ' + cat;
  openModal('budgetModal');
}

function initBudgets() {
  $('#budgetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var cat = $('#budgetCat').value;
    var amount = parseFloat($('#budgetAmount').value) || 0;
    APP.budgets[cat] = amount;
    saveBudgets();
    closeModal('budgetModal');
    toast('Budget updated for ' + cat, 'success');
    if (APP.view === 'budgets') renderBudgets();
  });
}

function renderCompare() {
  var months = getExpenseMonths();
  var selA = $('#compareA');
  var selB = $('#compareB');
  var prevA = selA.value, prevB = selB.value;

  var opts = months.map(function(m) { return '<option value="' + m + '">' + getMonthLabel(m) + '</option>'; }).join('');
  selA.innerHTML = opts;
  selB.innerHTML = opts;

  if (prevA && months.includes(prevA)) selA.value = prevA;
  else if (months.length > 0) selA.value = months[0];

  if (prevB && months.includes(prevB)) selB.value = prevB;
  else if (months.length > 1) selB.value = months[1];
  else if (months.length > 0) selB.value = months[0];

  updateCompare();
}

function updateCompare() {
  var keyA = $('#compareA').value;
  var keyB = $('#compareB').value;
  if (!keyA || !keyB) return;

  var expA = getMonthExpenses(keyA);
  var expB = getMonthExpenses(keyB);
  var totalA = expA.reduce(function(s, e) { return s + e.amount; }, 0);
  var totalB = expB.reduce(function(s, e) { return s + e.amount; }, 0);

  $('#compareSummary').innerHTML =
    '<div class="compare-stat"><div class="month-label" style="color:var(--primary)">' + getMonthLabel(keyA) + '</div>' +
      '<div class="amount">' + fmt(totalA) + '</div>' +
      '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">' + expA.length + ' transactions</div></div>' +
    '<div class="compare-stat"><div class="month-label">' + getMonthLabel(keyB) + '</div>' +
      '<div class="amount">' + fmt(totalB) + '</div>' +
      '<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">' + expB.length + ' transactions</div></div>';

  var dA = {}, dB = {};
  CATEGORIES.forEach(function(c) {
    dA[c.name] = getCatTotal(expA, c.name);
    dB[c.name] = getCatTotal(expB, c.name);
  });

  drawCompareChart($('#compareChart'), dA, dB, getMonthLabel(keyA), getMonthLabel(keyB));

  var rows = CATEGORIES.map(function(c) {
    var a = dA[c.name], b = dB[c.name], d = a - b;
    if (a === 0 && b === 0) return '';
    return '<tr><td>' + c.name + '</td>' +
      '<td style="font-weight:700">' + fmt(a) + '</td>' +
      '<td style="font-weight:700">' + fmt(b) + '</td>' +
      '<td><span class="' + (d > 0 ? 'diff-pos' : d < 0 ? 'diff-neg' : '') + '">' + (d > 0 ? '+' : '') + fmt(d) + '</span></td></tr>';
  }).filter(Boolean).join('');

  var diff = totalA - totalB;
  rows += '<tr style="border-top:2px solid var(--border);font-weight:800">' +
    '<td>Total</td><td>' + fmt(totalA) + '</td><td>' + fmt(totalB) + '</td>' +
    '<td><span class="' + (diff > 0 ? 'diff-pos' : diff < 0 ? 'diff-neg' : '') + '">' + (diff > 0 ? '+' : '') + fmt(diff) + '</span></td></tr>';

  $('#compareBody').innerHTML = rows;
}

function initCompare() {
  $('#compareA').addEventListener('change', updateCompare);
  $('#compareB').addEventListener('change', updateCompare);
}

var TIPS = [
  "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Cook at home more - eating out adds up fast as a student!",
  "Track every small expense. Those Rs.30 chais add up to Rs.900/month.",
  "Cancel subscriptions you don't use - audit them each month.",
  "Use student discounts everywhere you can!",
  "Set a weekly spending limit, not just monthly.",
  "Wait 24 hours before buying anything over Rs.500.",
  "Buy used textbooks or find PDFs online.",
  "Pack lunch instead of buying from the canteen every day.",
  "Split subscriptions with friends to save money."
];

function processChat(text) {
  var t = text.toLowerCase().trim();
  var curKey = getCurrentMonthKey();
  var curExp = getMonthExpenses(curKey);
  var totalSpent = curExp.reduce(function(s, e) { return s + e.amount; }, 0);

  if (/^(hi|hello|hey|howdy|yo|sup)\b/.test(t))
    return "Hey there! I'm Buddy. Ask me about your spending or type <strong>help</strong>!";

  if (/\b(help|what can you do|commands)\b/.test(t))
    return "Here's what I know:<br>-- <strong>total spending</strong> - your monthly total<br>-- <strong>spending on food</strong> - category total<br>-- <strong>budget status</strong> - are you on track?<br>-- <strong>top expenses</strong> - biggest spends<br>-- <strong>recent expenses</strong> - latest transactions<br>-- <strong>compare months</strong> - month vs month<br>-- <strong>give me a tip</strong> - saving advice<br>-- <strong>categories</strong> - list them all";

  if (/\b(total|overall|all).*(spend|expense|spent)\b|\bhow much.*(spend|spent)\b/.test(t))
    return "You've spent <strong>" + fmt(totalSpent) + "</strong> this month across <strong>" + curExp.length + "</strong> expenses. " + (totalSpent > 10000 ? "Might wanna slow down!" : "Looking good!");

  var catMatch = t.match(/(?:spend|spent|spending|how much).*(?:on|for)\s+(.+?)(?:\?|$|\.)|^(.+?)\s+(?:spend|expense)/);
  if (catMatch) {
    var query = (catMatch[1] || catMatch[2] || '').trim();
    var found = CATEGORIES.find(function(c) { return c.name.toLowerCase().includes(query); });
    if (found) {
      var amt = getCatTotal(curExp, found.name);
      var bud = APP.budgets[found.name] || 0;
      var resp = "<strong>" + found.name + "</strong>: " + fmt(amt) + " spent this month.";
      if (bud > 0) resp += " That's <strong>" + ((amt / bud) * 100).toFixed(0) + "%</strong> of your " + fmt(bud) + " budget.";
      return resp;
    }
  }

  if (/\b(budget|budgets)\b/.test(t)) {
    var totalBudget = Object.values(APP.budgets).reduce(function(s, v) { return s + v; }, 0);
    var rem = totalBudget - totalSpent;
    var r = "<strong>Budget Check:</strong><br>Budget: <strong>" + fmt(totalBudget) + "</strong> | Spent: <strong>" + fmt(totalSpent) + "</strong><br>";
    r += rem >= 0 ? "You have <strong>" + fmt(rem) + "</strong> left. Nice!" : "You're <strong>" + fmt(Math.abs(rem)) + "</strong> over budget!";
    var over = CATEGORIES.filter(function(c) { return getCatTotal(curExp, c.name) > (APP.budgets[c.name] || 0) && (APP.budgets[c.name] || 0) > 0; });
    if (over.length > 0) r += "<br>Over budget: " + over.map(function(c) { return c.name; }).join(", ");
    return r;
  }

  if (/\b(top|biggest|largest|most expensive|highest)\b/.test(t)) {
    var sorted = curExp.slice().sort(function(a, b) { return b.amount - a.amount; }).slice(0, 5);
    if (sorted.length === 0) return "No expenses this month yet!";
    return "<strong>Top expenses this month:</strong><br>" + sorted.map(function(e, i) {
      return (i + 1) + ". " + e.description + " — <strong>" + fmt(e.amount) + "</strong>";
    }).join("<br>");
  }

  if (/\b(recent|latest|last)\b/.test(t)) {
    var last5 = APP.expenses.slice(0, 5);
    if (last5.length === 0) return "Nothing recorded yet!";
    return "<strong>Recent:</strong><br>" + last5.map(function(e) {
      return "-- " + e.description + " — <strong>" + fmt(e.amount) + "</strong> (" + fmtDate(e.date) + ")";
    }).join("<br>");
  }

  if (/\b(compare|vs|versus|month.*over)\b/.test(t)) {
    var mons = getExpenseMonths();
    if (mons.length < 2) return "Need at least 2 months of data to compare!";
    var eA = getMonthExpenses(mons[0]), eB = getMonthExpenses(mons[1]);
    var tA = eA.reduce(function(s, e) { return s + e.amount; }, 0);
    var tB = eB.reduce(function(s, e) { return s + e.amount; }, 0);
    var d = tA - tB;
    return "<strong>" + getMonthLabel(mons[0]) + "</strong> vs <strong>" + getMonthLabel(mons[1]) + "</strong>:<br>" +
      getMonthLabel(mons[0]) + ": <strong>" + fmt(tA) + "</strong><br>" +
      getMonthLabel(mons[1]) + ": <strong>" + fmt(tB) + "</strong><br>" +
      "Difference: <strong>" + (d > 0 ? "+" : "") + fmt(d) + "</strong>";
  }

  if (/\b(average|avg|mean)\b/.test(t)) {
    if (curExp.length === 0) return "No expenses to average yet!";
    return "Your average expense is <strong>" + fmt(totalSpent / curExp.length) + "</strong> across " + curExp.length + " transactions.";
  }

  if (/\b(how many|count|number)\b/.test(t))
    return "You have <strong>" + curExp.length + "</strong> transactions this month and <strong>" + APP.expenses.length + "</strong> total.";

  if (/\bcategor/.test(t))
    return "<strong>Categories:</strong><br>" + CATEGORIES.map(function(c) { return "-- " + c.name; }).join("<br>");

  if (/\b(tip|advice|suggest|save|saving)\b/.test(t))
    return "<strong>Tip:</strong> " + TIPS[Math.floor(Math.random() * TIPS.length)];

  if (/\b(add|new|create|log)\b.*\b(expense|transaction)\b/.test(t))
    return "Head to the <strong>Expenses</strong> page and hit <strong>+ Add Expense</strong>!";

  if (/\b(who are you|what are you|your name)\b/.test(t))
    return "I'm <strong>Buddy</strong> - a simple rule-based bot (no AI!) that reads your expense data and answers questions. Your data stays in your browser!";

  if (/\b(thank|thx|ty)\b/.test(t)) return "No problem!";
  if (/\b(bye|goodbye|see you|later)\b/.test(t)) return "See ya! Keep tracking!";

  return "Hmm, not sure about that. Try <strong>help</strong> to see what I can answer!";
}

function addUserMsg(text) {
  var div = document.createElement('div');
  div.className = 'chat-msg user';
  div.textContent = text;
  $('#chatMessages').appendChild(div);
  scrollChat();
}

function addBotMsg(text) {
  var div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.innerHTML = text;
  $('#chatMessages').appendChild(div);
  scrollChat();
}

function scrollChat() {
  var el = $('#chatMessages');
  setTimeout(function() { el.scrollTop = el.scrollHeight; }, 50);
}

function sendChat() {
  var input = $('#chatInput');
  var text = input.value.trim();
  if (!text) return;
  addUserMsg(text);
  input.value = '';
  setTimeout(function() { addBotMsg(processChat(text)); }, 250 + Math.random() * 300);
}

function initChatbot() {
  $('#chatToggle').addEventListener('click', function() {
    APP.chatOpen = !APP.chatOpen;
    $('#chatPanel').classList.toggle('open', APP.chatOpen);
  });

  $('#chatSend').addEventListener('click', sendChat);
  $('#chatInput').addEventListener('keydown', function(e) { if (e.key === 'Enter') sendChat(); });

  $$('.chat-suggestions button').forEach(function(btn) {
    btn.addEventListener('click', function() {
      $('#chatInput').value = btn.dataset.msg;
      sendChat();
    });
  });
}

function openModal(id) { $('#' + id).classList.add('open'); }
function closeModal(id) { $('#' + id).classList.remove('open'); }

function initModals() {
  $$('.modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      $$('.modal-overlay.open').forEach(function(m) { m.classList.remove('open'); });
      if (APP.chatOpen) { APP.chatOpen = false; $('#chatPanel').classList.remove('open'); }
    }
  });
}

function initMobile() {
  $('#menuToggle').addEventListener('click', function() {
    $('#sidebar').classList.toggle('open');
    $('#sidebarOverlay').classList.toggle('open');
  });
  $('#sidebarOverlay').addEventListener('click', function() {
    $('#sidebar').classList.remove('open');
    $('#sidebarOverlay').classList.remove('open');
  });
}

function initResize() {
  var timer;
  window.addEventListener('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      if (APP.view === 'dashboard') renderDashboard();
      if (APP.view === 'compare') updateCompare();
    }, 200);
  });
}

function init() {
  initAuth();
  initExpenses();
  initBudgets();
  initCompare();
  initChatbot();
  initModals();
  initMobile();
  initResize();

  $$('.nav-item').forEach(function(item) {
    item.addEventListener('click', function() { navigateTo(item.dataset.view); });
  });

  $('#logoutBtn').addEventListener('click', logout);
  $('#resetBtn').addEventListener('click', resetData);

  var session = getSession();
  if (session) {
    var users = getUsers();
    var user = users.find(function(u) { return u.username === session.username; });
    if (user) {
      APP.user = { username: user.username, name: user.name };
      enterApp();
      return;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);