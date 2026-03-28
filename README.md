# ScheduleApp – Time Schedule & Appointment Manager

A clean, fully client-side web app for managing your daily schedule and appointments.  
No server or build step required – just open `index.html` in any modern browser.

---

## Features

| Feature | Details |
|---|---|
| 📅 Interactive calendar | Monthly calendar with coloured dot indicators for days that have appointments |
| ➕ Add / Edit / Delete | Full CRUD for appointments with title, date, start/end time, location, category, notes, and a colour label |
| 🔍 Search & Filter | Real-time search and category filter on the daily appointment list |
| 📋 List view | Compact card list of appointments for a selected day |
| 🕐 Timeline view | 24-hour timeline showing when each appointment falls |
| 📊 Stats strip | Quick counters for today's, upcoming, and total appointments |
| 💾 Persistent storage | Appointments are saved in `localStorage` – they survive page refreshes |
| ⌨️ Keyboard shortcuts | `Ctrl/⌘ + N` to open new appointment; `Escape` to close modal |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## Getting Started

1. Clone or download this repository.
2. Open **`index.html`** in your browser – no install or build required.
3. A handful of sample appointments are pre-loaded on first run so you can explore immediately.

---

## File Structure

```
index.html   – Application markup
style.css    – All styles (CSS custom properties, responsive grid)
app.js       – JavaScript: calendar, CRUD, localStorage, UI logic
README.md    – This file
```

---

## Usage Tips

- **Select a day** by clicking any date on the mini calendar.
- **Add an appointment** with the blue "+ Add Appointment" button or `Ctrl+N`.
- **Edit** an appointment by clicking the pencil icon on its card.
- **Delete** with the trash icon (asks for confirmation).
- Switch between **List** and **Timeline** views with the tabs above the appointment panel.
- Use the **search box** to filter by title, location, or notes; use the **category dropdown** to narrow by type.