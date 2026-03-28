// ──────────────────────────────────────────────────────────────────────────────
// ScheduleApp – Appointment & Time Schedule Manager
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'scheduleapp_appointments';

// ── Data ─────────────────────────────────────────────────────────────────────
let appointments = loadAppointments();
let currentDate  = new Date();       // controls which month is shown
let selectedDate = today();          // ISO yyyy-mm-dd string
let editingId    = null;
let activeView   = 'list';           // 'list' | 'timeline'

// ── Colour palette for appointments ──────────────────────────────────────────
// Available color options for appointment labels (aligned with the design system palette)
const COLORS = [
  { hex: '#4f46e5', label: 'Indigo'  },
  { hex: '#06b6d4', label: 'Cyan'    },
  { hex: '#10b981', label: 'Green'   },
  { hex: '#f59e0b', label: 'Amber'   },
  { hex: '#ef4444', label: 'Red'     },
  { hex: '#8b5cf6', label: 'Purple'  },
  { hex: '#ec4899', label: 'Pink'    },
  { hex: '#64748b', label: 'Slate'   },
];

const CATEGORIES = ['General', 'Meeting', 'Medical', 'Personal', 'Work', 'Other'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function isoDate(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function formatDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatShort(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

function to12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h % 12) || 12);
  return `${h12}:${String(m).padStart(2,'0')} ${suffix}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadAppointments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedData();
  } catch {
    return seedData();
  }
}

function saveAppointments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

/** Pre-load a few demo appointments so the app looks useful on first load */
function seedData() {
  const t = today();
  const [ty, tm, td] = t.split('-').map(Number);
  const tomorrow = isoDate(ty, tm, td + 1);
  return [
    {
      id: uid(), title: 'Team Stand-up', date: t,
      startTime: '09:00', endTime: '09:30',
      category: 'Meeting', color: '#4f46e5',
      location: 'Conference Room A',
      notes: 'Daily sync with the engineering team.',
    },
    {
      id: uid(), title: 'Doctor Appointment', date: t,
      startTime: '11:00', endTime: '11:45',
      category: 'Medical', color: '#10b981',
      location: 'City Health Clinic',
      notes: 'Annual physical check-up.',
    },
    {
      id: uid(), title: 'Lunch with Client', date: t,
      startTime: '12:30', endTime: '14:00',
      category: 'Work', color: '#f59e0b',
      location: 'The Grand Bistro',
      notes: 'Discuss Q2 roadmap.',
    },
    {
      id: uid(), title: 'Project Review', date: tomorrow,
      startTime: '10:00', endTime: '11:00',
      category: 'Work', color: '#8b5cf6',
      location: 'Zoom',
      notes: '',
    },
  ];
}

// ── Appointment helpers ───────────────────────────────────────────────────────
function appointmentsOnDate(iso) {
  return appointments
    .filter(a => a.date === iso)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
}

function upcomingCount() {
  const t = today();
  return appointments.filter(a => a.date >= t).length;
}

function todayCount() {
  return appointmentsOnDate(today()).length;
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function renderStats() {
  const el = document.getElementById('statsStrip');
  const tc = todayCount();
  const uc = upcomingCount();
  const total = appointments.length;
  el.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon blue">📅</div>
      <div class="stat-info">
        <p>Today</p>
        <h3>${tc}</h3>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green">🔜</div>
      <div class="stat-info">
        <p>Upcoming</p>
        <h3>${uc}</h3>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber">📋</div>
      <div class="stat-info">
        <p>Total</p>
        <h3>${total}</h3>
      </div>
    </div>`;
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function renderCalendar() {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth(); // 0-based

  document.getElementById('calMonthLabel').textContent =
    new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const grid = document.getElementById('calGrid');
  // Remove existing day cells (keep day-name headers = first 7 children)
  const headers = grid.querySelectorAll('.day-name');
  grid.innerHTML = '';
  headers.forEach(h => grid.appendChild(h.cloneNode(true)));

  const firstDay = new Date(y, m, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const daysInPrevMonth = new Date(y, m, 0).getDate();

  const todayIso = today();

  // Leading empty / previous-month days
  for (let i = 0; i < firstDay; i++) {
    const d = daysInPrevMonth - firstDay + 1 + i;
    const iso = isoDate(y, m, d); // prev month day – approximate iso
    const cell = document.createElement('div');
    cell.className = 'cal-day other-month empty';
    cell.textContent = d;
    grid.appendChild(cell);
  }

  // Current-month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoDate(y, m + 1, d);
    const apts = appointmentsOnDate(iso);
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    if (iso === todayIso) cell.classList.add('today');
    if (iso === selectedDate) cell.classList.add('selected');
    if (apts.length) cell.classList.add('has-events');

    const dots = apts.slice(0, 3).map(a =>
      `<div class="event-dot" style="background:${a.color}"></div>`
    ).join('');

    cell.innerHTML = `<span>${d}</span><div class="dot-row">${dots}</div>`;
    cell.addEventListener('click', () => selectDate(iso));
    grid.appendChild(cell);
  }

  // Trailing empty cells
  const total = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= trailing; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day other-month empty';
    cell.textContent = d;
    grid.appendChild(cell);
  }
}

function selectDate(iso) {
  selectedDate = iso;
  renderCalendar();
  renderAppointments();
  // Jump calendar to correct month if needed
  const [y, m] = iso.split('-').map(Number);
  if (currentDate.getFullYear() !== y || currentDate.getMonth() + 1 !== m) {
    currentDate = new Date(y, m - 1, 1);
    renderCalendar();
  }
}

// ── Appointment List / Timeline view ─────────────────────────────────────────
function renderAppointments() {
  const header = document.getElementById('aptDateLabel');
  const badge  = document.getElementById('aptDateBadge');
  const display = formatDisplay(selectedDate);
  header.textContent = display;
  badge.textContent  = formatShort(selectedDate);

  if (activeView === 'list') renderListView();
  else renderTimelineView();
}

function getFilteredApts() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const cat    = document.getElementById('catFilter').value;
  return appointmentsOnDate(selectedDate)
    .filter(a => {
      const matchSearch = !search ||
        a.title.toLowerCase().includes(search) ||
        (a.notes || '').toLowerCase().includes(search) ||
        (a.location || '').toLowerCase().includes(search);
      const matchCat = !cat || a.category === cat;
      return matchSearch && matchCat;
    });
}

function renderListView() {
  const container = document.getElementById('aptListContainer');
  const apts = getFilteredApts();

  if (!apts.length) {
    container.innerHTML = `
      <div class="no-appointments">
        <div class="icon">📭</div>
        <p>No appointments found</p>
        <small>Click "+ Add" to schedule one for this day</small>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="appointment-list">${
    apts.map(a => aptItemHTML(a)).join('')
  }</div>`;

  container.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.edit)));
  container.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', () => deleteAppointment(btn.dataset.delete)));
}

function aptItemHTML(a) {
  const timeStr = a.startTime
    ? `${to12h(a.startTime)}${a.endTime ? ' – ' + to12h(a.endTime) : ''}`
    : 'All day';
  const cat = a.category || 'General';
  const catColor = categoryColor(cat);

  return `
    <div class="apt-item">
      <div class="apt-color-bar" style="background:${a.color}"></div>
      <div class="apt-body">
        <div class="apt-title">${escHtml(a.title)}</div>
        <div class="apt-meta">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ${timeStr}
          </span>
          ${a.location ? `<span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            ${escHtml(a.location)}
          </span>` : ''}
          <span><span class="apt-tag" style="background:${catColor.bg};color:${catColor.text}">${cat}</span></span>
        </div>
        <div class="apt-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${a.id}" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn btn-ghost btn-sm" data-delete="${a.id}" title="Delete"
            style="color:var(--danger)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

function renderTimelineView() {
  const container = document.getElementById('aptListContainer');
  const apts = appointmentsOnDate(selectedDate);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const slots = hours.map(h => {
    const timeKey = String(h).padStart(2, '0') + ':';
    const slotApts = apts.filter(a => (a.startTime || '').startsWith(timeKey));
    return { h, apts: slotApts };
  });

  container.innerHTML = `<div class="timeline">${
    slots.map(s => {
      const label = to12h(`${String(s.h).padStart(2,'0')}:00`);
      const events = s.apts.map(a => `
        <div class="slot-event" style="background:${hexAlpha(a.color,.15)};border-left:3px solid ${a.color};color:${a.color}"
          data-edit="${a.id}">
          <div>${escHtml(a.title)}</div>
          <div class="slot-event-time">${to12h(a.startTime)}${a.endTime ? ' – ' + to12h(a.endTime) : ''}</div>
        </div>`).join('');
      return `
        <div class="timeline-slot">
          <div class="slot-time">${label}</div>
          <div class="slot-line-col">
            <div class="slot-dot" style="${s.apts.length ? 'background:var(--primary)' : ''}"></div>
            <div class="slot-line"></div>
          </div>
          <div class="slot-events">${events}</div>
        </div>`;
    }).join('')
  }</div>`;

  container.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.edit)));
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(id) {
  editingId = id || null;
  const apt = editingId ? appointments.find(a => a.id === editingId) : null;

  document.getElementById('modalTitle').textContent = editingId ? 'Edit Appointment' : 'New Appointment';
  document.getElementById('fTitle').value     = apt?.title    || '';
  document.getElementById('fDate').value      = apt?.date     || selectedDate;
  document.getElementById('fStart').value     = apt?.startTime || '';
  document.getElementById('fEnd').value       = apt?.endTime  || '';
  document.getElementById('fLocation').value  = apt?.location || '';
  document.getElementById('fNotes').value     = apt?.notes    || '';
  document.getElementById('fCategory').value  = apt?.category || 'General';

  const selectedColor = apt?.color || COLORS[0].hex;
  renderColorPicker(selectedColor);

  document.getElementById('modalBackdrop').classList.add('open');
  document.getElementById('fTitle').focus();
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  editingId = null;
}

function renderColorPicker(selectedColor) {
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = COLORS.map(c => `
    <div class="color-swatch${c.hex === selectedColor ? ' active' : ''}"
      style="background:${c.hex}"
      data-color="${c.hex}"
      title="${c.label}">
    </div>`).join('');
  picker.querySelectorAll('.color-swatch').forEach(s =>
    s.addEventListener('click', () => {
      picker.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('active'));
      s.classList.add('active');
    }));
}

function saveAppointment() {
  const title = document.getElementById('fTitle').value.trim();
  if (!title) { showToast('Please enter a title', 'danger'); return; }
  const date = document.getElementById('fDate').value;
  if (!date) { showToast('Please select a date', 'danger'); return; }

  const color = document.getElementById('colorPicker')
    .querySelector('.color-swatch.active')?.dataset.color || COLORS[0].hex;

  const data = {
    id: editingId || uid(),
    title,
    date,
    startTime: document.getElementById('fStart').value,
    endTime:   document.getElementById('fEnd').value,
    location:  document.getElementById('fLocation').value.trim(),
    notes:     document.getElementById('fNotes').value.trim(),
    category:  document.getElementById('fCategory').value,
    color,
  };

  if (editingId) {
    const idx = appointments.findIndex(a => a.id === editingId);
    appointments[idx] = data;
    showToast('Appointment updated ✓', 'success');
  } else {
    appointments.push(data);
    showToast('Appointment added ✓', 'success');
  }

  saveAppointments();
  closeModal();
  selectedDate = date;
  renderAll();
}

function deleteAppointment(id) {
  if (!confirm('Delete this appointment?')) return;
  appointments = appointments.filter(a => a.id !== id);
  saveAppointments();
  showToast('Appointment deleted', 'danger');
  renderAll();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = '') {
  const tc = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  tc.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, 2800);
}

// ── Misc helpers ──────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const CAT_COLORS = {
  General:  { bg: '#e0e7ff', text: '#4f46e5' },
  Meeting:  { bg: '#cffafe', text: '#0e7490' },
  Medical:  { bg: '#d1fae5', text: '#047857' },
  Personal: { bg: '#fce7f3', text: '#9d174d' },
  Work:     { bg: '#fef3c7', text: '#92400e' },
  Other:    { bg: '#f1f5f9', text: '#475569' },
};
function categoryColor(cat) {
  return CAT_COLORS[cat] || CAT_COLORS.Other;
}

// ── Render everything ─────────────────────────────────────────────────────────
function renderAll() {
  renderStats();
  renderCalendar();
  renderAppointments();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Calendar navigation
  document.getElementById('calPrev').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById('calToday').addEventListener('click', () => {
    currentDate = new Date();
    selectDate(today());
  });

  // View tabs
  document.getElementById('tabList').addEventListener('click', () => {
    activeView = 'list';
    document.getElementById('tabList').classList.add('active');
    document.getElementById('tabTimeline').classList.remove('active');
    renderAppointments();
  });
  document.getElementById('tabTimeline').addEventListener('click', () => {
    activeView = 'timeline';
    document.getElementById('tabTimeline').classList.add('active');
    document.getElementById('tabList').classList.remove('active');
    renderAppointments();
  });

  // Add button
  document.getElementById('btnAdd').addEventListener('click', () => openModal());
  document.getElementById('btnAddHeader').addEventListener('click', () => openModal());

  // Modal controls
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('btnCancelModal').addEventListener('click', closeModal);
  document.getElementById('btnSaveModal').addEventListener('click', saveAppointment);
  document.getElementById('modalBackdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBackdrop')) closeModal();
  });

  // Search & filter
  document.getElementById('searchInput').addEventListener('input', renderAppointments);
  document.getElementById('catFilter').addEventListener('change', renderAppointments);

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openModal(); }
  });

  renderAll();
});
