document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendar-grid');
    const monthYear = document.getElementById('month-year-display');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const modal = document.getElementById('activity-modal');
    const activityDate = document.getElementById('activity-date');
    const activityList = document.getElementById('activity-list');
    
    let currentDate = new Date();

    function renderCalendar() {
        grid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYear.textContent = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const journeyData = window.store.state.journey || {};

        // Generate empty slots
        for (let i = 0; i < firstDay; i++) {
            let emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            grid.appendChild(emptyDiv);
        }

        // Generate active day slots
        for (let i = 1; i <= daysInMonth; i++) {
            let dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            dayDiv.textContent = i;
            
            // Format YYYY-MM-DD
            let dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
            
            if (journeyData[dateKey] && journeyData[dateKey].length > 0) {
                dayDiv.classList.add('has-event');
                dayDiv.addEventListener('click', () => {
                    activityDate.textContent = new Date(dateKey).toLocaleDateString([], {weekday: 'long', day:'numeric', month:'long', year:'numeric'});
                    activityList.innerHTML = journeyData[dateKey].map(e => `
                        <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid var(--glass-border);">
                            <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">${e.type}</span><br>
                            <span style="font-size:1.1rem;">${e.data}</span>
                        </div>
                    `).join('');
                    modal.classList.add('active');
                });
            }
            grid.appendChild(dayDiv);
        }
    }

    prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    document.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
    window.store.subscribe(renderCalendar);
});